import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SponsorshipService } from './sponsorship.service';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SponsorshipType } from './entities/sponsorship.entity';

@ApiTags('sponsorship')
@Controller('sponsorship')
export class SponsorshipController {
  constructor(
    private readonly sponsorshipService: SponsorshipService,
    private readonly stripeService: StripeService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('sponsor')
  @ApiOperation({ summary: 'Get or create sponsor profile' })
  @ApiResponse({ status: 200, description: 'Sponsor profile' })
  async getSponsor(@Request() req) {
    return this.sponsorshipService.getOrCreateSponsor(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('contribute')
  @ApiOperation({ summary: 'Create a contribution' })
  @ApiResponse({ status: 201, description: 'Contribution created' })
  async contribute(
    @Request() req,
    @Body() body: { amount: number; currency?: string; beneficiaryId?: string; message?: string },
  ) {
    return this.sponsorshipService.createContribution(
      req.user.userId,
      body.amount,
      body.currency || 'usd',
      body.beneficiaryId,
      body.message,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('create')
  @ApiOperation({ summary: 'Create a sponsorship' })
  @ApiResponse({ status: 201, description: 'Sponsorship created' })
  async createSponsorship(
    @Request() req,
    @Body() body: {
      beneficiaryId: string;
      type: SponsorshipType;
      monthlyAmount?: number;
      totalPledged?: number;
      goalId?: string;
      milestoneRewards?: Array<{ milestoneId: string; tokenAmount: number; cashAmount?: number }>;
    },
  ) {
    return this.sponsorshipService.createSponsorship(
      req.user.userId,
      body.beneficiaryId,
      body.type,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-sponsorships')
  @ApiOperation({ summary: 'Get sponsorships where user is sponsor' })
  @ApiResponse({ status: 200, description: 'List of sponsorships' })
  async getMySponsorships(@Request() req) {
    return this.sponsorshipService.getSponsorships(req.user.userId, 'sponsor');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('received')
  @ApiOperation({ summary: 'Get sponsorships received by user' })
  @ApiResponse({ status: 200, description: 'List of received sponsorships' })
  async getReceivedSponsorships(@Request() req) {
    return this.sponsorshipService.getSponsorships(req.user.userId, 'beneficiary');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/claim-reward/:milestoneId')
  @ApiOperation({ summary: 'Claim milestone reward' })
  @ApiResponse({ status: 200, description: 'Reward claimed' })
  async claimReward(
    @Request() req,
    @Param('id') sponsorshipId: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.sponsorshipService.claimMilestoneReward(
      req.user.userId,
      sponsorshipId,
      milestoneId,
      req.user.isMinor,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('ledger')
  @ApiOperation({ summary: 'Get sponsorship ledger history' })
  @ApiResponse({ status: 200, description: 'Ledger history' })
  async getLedger(@Request() req) {
    return this.sponsorshipService.getLedgerHistory(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription entitlements' })
  @ApiResponse({ status: 200, description: 'Subscription entitlements' })
  async getSubscription(@Request() req) {
    return this.sponsorshipService.getSubscriptionEntitlements(req.user.userId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      if (!req.rawBody) {
        return { received: false, error: 'Missing raw body' };
      }
      const event = await this.stripeService.constructWebhookEvent(
        req.rawBody,
        signature,
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as any;
          await this.sponsorshipService.handlePaymentSuccess(paymentIntent.id);
          break;
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      return { received: false, error: error.message };
    }
  }
}
