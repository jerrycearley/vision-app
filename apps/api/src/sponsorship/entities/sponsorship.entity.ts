import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Sponsor } from './sponsor.entity';
import { Goal } from '../../goals/entities/goal.entity';

export enum SponsorshipType {
  MONTHLY = 'monthly',
  ONE_TIME = 'one_time',
  MILESTONE_BASED = 'milestone_based',
  GOAL_BASED = 'goal_based',
}

export enum SponsorshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('sponsorships')
export class Sponsorship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sponsorId: string;

  @ManyToOne(() => Sponsor, (sponsor) => sponsor.sponsorships)
  @JoinColumn({ name: 'sponsorId' })
  sponsor: Sponsor;

  @Column()
  beneficiaryId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'beneficiaryId' })
  beneficiary: User;

  @Column({
    type: 'enum',
    enum: SponsorshipType,
    default: SponsorshipType.ONE_TIME,
  })
  type: SponsorshipType;

  @Column({
    type: 'enum',
    enum: SponsorshipStatus,
    default: SponsorshipStatus.PENDING,
  })
  status: SponsorshipStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalPledged: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDistributed: number;

  @Column({ default: 'usd' })
  currency: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  goalId: string;

  @ManyToOne(() => Goal, { nullable: true })
  @JoinColumn({ name: 'goalId' })
  goal: Goal;

  @Column({ type: 'jsonb', default: [] })
  milestoneRewards: Array<{
    milestoneId: string;
    tokenAmount: number;
    cashAmount?: number;
    currency?: string;
    claimed: boolean;
    claimedAt?: Date;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
