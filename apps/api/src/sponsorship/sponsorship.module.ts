import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SponsorshipController } from './sponsorship.controller';
import { SponsorshipService } from './sponsorship.service';
import { StripeService } from './stripe.service';
import { Sponsor } from './entities/sponsor.entity';
import { Sponsorship } from './entities/sponsorship.entity';
import { SponsorshipLedgerEntry } from './entities/sponsorship-ledger-entry.entity';
import { SubscriptionEntitlement } from './entities/subscription-entitlement.entity';
import { User } from '../users/entities/user.entity';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sponsor, Sponsorship, SponsorshipLedgerEntry, SubscriptionEntitlement, User]),
    ConfigModule,
    TokensModule,
  ],
  controllers: [SponsorshipController],
  providers: [SponsorshipService, StripeService],
  exports: [SponsorshipService],
})
export class SponsorshipModule {}
