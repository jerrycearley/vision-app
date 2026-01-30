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

export enum LockReason {
  MINOR_PROTECTION = 'minor_protection',
  VESTING = 'vesting',
  STAKING = 'staking',
  GUARDIAN_REQUESTED = 'guardian_requested',
}

@Entity('token_lock_status')
export class TokenLockStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  lockedAmount: number;

  @Column({
    type: 'enum',
    enum: LockReason,
    default: LockReason.MINOR_PROTECTION,
  })
  lockReason: LockReason;

  @Column({ type: 'timestamp' })
  lockStartDate: Date;

  @Column({ type: 'timestamp' })
  unlockDate: Date;

  @Column({ default: false })
  guardianApprovedEarlyUnlock: boolean;

  @Column({ nullable: true })
  guardianId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'guardianId' })
  guardian: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
