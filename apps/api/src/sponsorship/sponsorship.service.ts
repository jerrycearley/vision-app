import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor, SponsorType, SponsorStatus } from './entities/sponsor.entity';
import { Sponsorship, SponsorshipType, SponsorshipStatus } from './entities/sponsorship.entity';
import { SponsorshipLedgerEntry, SponsorshipTransactionType, PaymentStatus } from './entities/sponsorship-ledger-entry.entity';
import { SubscriptionEntitlement, SubscriptionStatus } from './entities/subscription-entitlement.entity';
import { User } from '../users/entities/user.entity';
import { StripeService } from './stripe.service';
import { TokensService } from '../tokens/tokens.service';
import { TokenReferenceType } from '../tokens/entities/token-ledger-entry.entity';

@Injectable()
export class SponsorshipService {
  constructor(
    @InjectRepository(Sponsor)
    private sponsorRepository: Repository<Sponsor>,
    @InjectRepository(Sponsorship)
    private sponsorshipRepository: Repository<Sponsorship>,
    @InjectRepository(SponsorshipLedgerEntry)
    private ledgerRepository: Repository<SponsorshipLedgerEntry>,
    @InjectRepository(SubscriptionEntitlement)
    private entitlementRepository: Repository<SubscriptionEntitlement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private stripeService: StripeService,
    private tokensService: TokensService,
  ) {}

  async getOrCreateSponsor(userId: string): Promise<Sponsor> {
    let sponsor = await this.sponsorRepository.findOne({ where: { userId } });

    if (!sponsor) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      sponsor = this.sponsorRepository.create({
        userId,
        type: SponsorType.INDIVIDUAL,
        status: SponsorStatus.PENDING,
        totalContributed: 0,
      });

      // Create Stripe customer if Stripe is configured
      if (this.stripeService.isConfigured()) {
        const customer = await this.stripeService.createCustomer(
          user.email,
          user.displayName,
          { userId },
        );
        sponsor.stripeCustomerId = customer.id;
      }

      await this.sponsorRepository.save(sponsor);
    }

    return sponsor;
  }

  async createContribution(
    userId: string,
    amount: number,
    currency: string,
    beneficiaryId?: string,
    message?: string,
  ): Promise<{ clientSecret?: string; ledgerEntry: SponsorshipLedgerEntry }> {
    const sponsor = await this.getOrCreateSponsor(userId);

    if (!this.stripeService.isConfigured()) {
      throw new BadRequestException('Payment processing not configured');
    }

    if (!sponsor.stripeCustomerId) {
      throw new BadRequestException('Sponsor payment setup incomplete');
    }

    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      currency,
      sponsor.stripeCustomerId,
      {
        sponsorId: sponsor.id,
        beneficiaryId: beneficiaryId || '',
        type: 'contribution',
      },
    );

    const ledgerEntry = this.ledgerRepository.create({
      sponsorId: sponsor.id,
      beneficiaryId,
      type: SponsorshipTransactionType.CONTRIBUTION,
      amount,
      currency,
      stripePaymentIntentId: paymentIntent.id,
      status: PaymentStatus.PENDING,
      description: message || 'Contribution',
    });

    await this.ledgerRepository.save(ledgerEntry);

    return {
      clientSecret: paymentIntent.client_secret ?? undefined,
      ledgerEntry,
    };
  }

  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    const ledgerEntry = await this.ledgerRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!ledgerEntry) {
      return;
    }

    ledgerEntry.status = PaymentStatus.SUCCEEDED;
    await this.ledgerRepository.save(ledgerEntry);

    // Update sponsor total
    const sponsor = await this.sponsorRepository.findOne({
      where: { id: ledgerEntry.sponsorId },
    });

    if (sponsor) {
      sponsor.totalContributed = Number(sponsor.totalContributed) + Number(ledgerEntry.amount);
      sponsor.status = SponsorStatus.ACTIVE;
      await this.sponsorRepository.save(sponsor);
    }

    // If there's a beneficiary, issue tokens
    if (ledgerEntry.beneficiaryId) {
      const beneficiary = await this.userRepository.findOne({
        where: { id: ledgerEntry.beneficiaryId },
      });

      if (beneficiary) {
        const tokenAmount = this.calculateTokensFromContribution(Number(ledgerEntry.amount));

        await this.tokensService.issueTokens({
          userId: ledgerEntry.beneficiaryId,
          amount: tokenAmount,
          reason: TokenReferenceType.SPONSORSHIP,
          referenceId: ledgerEntry.id,
          description: `Sponsorship contribution of ${ledgerEntry.amount} ${ledgerEntry.currency}`,
          applyMinorLock: beneficiary.isMinor,
        });
      }
    }
  }

  async createSponsorship(
    sponsorUserId: string,
    beneficiaryId: string,
    type: SponsorshipType,
    options: {
      monthlyAmount?: number;
      totalPledged?: number;
      goalId?: string;
      milestoneRewards?: Array<{ milestoneId: string; tokenAmount: number; cashAmount?: number }>;
    },
  ): Promise<Sponsorship> {
    const sponsor = await this.getOrCreateSponsor(sponsorUserId);

    const sponsorship = this.sponsorshipRepository.create({
      sponsorId: sponsor.id,
      beneficiaryId,
      type,
      status: SponsorshipStatus.PENDING,
      monthlyAmount: options.monthlyAmount,
      totalPledged: options.totalPledged,
      currency: 'usd',
      startDate: new Date(),
      goalId: options.goalId,
      milestoneRewards: options.milestoneRewards?.map((r) => ({
        ...r,
        claimed: false,
      })) || [],
    });

    await this.sponsorshipRepository.save(sponsorship);

    return sponsorship;
  }

  async getSponsorships(userId: string, role: 'sponsor' | 'beneficiary'): Promise<Sponsorship[]> {
    const sponsor = await this.sponsorRepository.findOne({ where: { userId } });

    if (role === 'sponsor' && sponsor) {
      return this.sponsorshipRepository.find({
        where: { sponsorId: sponsor.id },
        relations: ['beneficiary', 'goal'],
      });
    }

    return this.sponsorshipRepository.find({
      where: { beneficiaryId: userId },
      relations: ['sponsor', 'goal'],
    });
  }

  async claimMilestoneReward(
    userId: string,
    sponsorshipId: string,
    milestoneId: string,
    isMinor: boolean,
  ): Promise<{ tokenAmount: number; cashAmount?: number }> {
    const sponsorship = await this.sponsorshipRepository.findOne({
      where: { id: sponsorshipId, beneficiaryId: userId },
    });

    if (!sponsorship) {
      throw new NotFoundException('Sponsorship not found');
    }

    const rewardIndex = sponsorship.milestoneRewards.findIndex(
      (r) => r.milestoneId === milestoneId && !r.claimed,
    );

    if (rewardIndex === -1) {
      throw new BadRequestException('Reward not found or already claimed');
    }

    const reward = sponsorship.milestoneRewards[rewardIndex];

    // Issue tokens
    if (reward.tokenAmount > 0) {
      await this.tokensService.issueTokens({
        userId,
        amount: reward.tokenAmount,
        reason: TokenReferenceType.SPONSORSHIP,
        referenceId: `${sponsorshipId}-${milestoneId}`,
        description: `Milestone reward from sponsorship`,
        applyMinorLock: isMinor,
      });
    }

    // Mark as claimed
    sponsorship.milestoneRewards[rewardIndex].claimed = true;
    sponsorship.milestoneRewards[rewardIndex].claimedAt = new Date();
    sponsorship.totalDistributed = Number(sponsorship.totalDistributed) + (reward.cashAmount || 0);

    await this.sponsorshipRepository.save(sponsorship);

    return {
      tokenAmount: reward.tokenAmount,
      cashAmount: reward.cashAmount,
    };
  }

  async getLedgerHistory(userId: string): Promise<SponsorshipLedgerEntry[]> {
    const sponsor = await this.sponsorRepository.findOne({ where: { userId } });

    if (!sponsor) {
      return [];
    }

    return this.ledgerRepository.find({
      where: { sponsorId: sponsor.id },
      order: { createdAt: 'DESC' },
    });
  }

  async getSubscriptionEntitlements(userId: string): Promise<SubscriptionEntitlement | null> {
    return this.entitlementRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
  }

  private calculateTokensFromContribution(amount: number): number {
    // $1 = 10 tokens
    return Math.floor(amount * 10);
  }
}
