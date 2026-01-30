import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Sponsor } from './sponsor.entity';
import { User } from '../../users/entities/user.entity';

export enum SponsorshipTransactionType {
  CONTRIBUTION = 'contribution',
  SUBSCRIPTION_PAYMENT = 'subscription_payment',
  REFUND = 'refund',
  ALLOCATION = 'allocation',
  PAYOUT = 'payout',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

@Entity('sponsorship_ledger_entries')
@Index(['sponsorId', 'createdAt'])
export class SponsorshipLedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sponsorId: string;

  @ManyToOne(() => Sponsor)
  @JoinColumn({ name: 'sponsorId' })
  sponsor: Sponsor;

  @Column({ nullable: true })
  beneficiaryId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'beneficiaryId' })
  beneficiary: User;

  @Column({
    type: 'enum',
    enum: SponsorshipTransactionType,
  })
  type: SponsorshipTransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'usd' })
  currency: string;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeChargeId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column()
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
