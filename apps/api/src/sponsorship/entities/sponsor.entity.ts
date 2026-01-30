import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Sponsorship } from './sponsorship.entity';

export enum SponsorType {
  INDIVIDUAL = 'individual',
  FAMILY = 'family',
  ORGANIZATION = 'organization',
  CORPORATE = 'corporate',
}

export enum SponsorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

@Entity('sponsors')
export class Sponsor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  organizationName: string;

  @Column({
    type: 'enum',
    enum: SponsorType,
    default: SponsorType.INDIVIDUAL,
  })
  type: SponsorType;

  @Column({
    type: 'enum',
    enum: SponsorStatus,
    default: SponsorStatus.PENDING,
  })
  status: SponsorStatus;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalContributed: number;

  @OneToMany(() => Sponsorship, (sponsorship) => sponsorship.sponsor)
  sponsorships: Sponsorship[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
