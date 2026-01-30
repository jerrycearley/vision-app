import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TokenTransactionType {
  EARN = 'earn',
  SPEND = 'spend',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  MINT = 'mint',
  BURN = 'burn',
}

export enum TokenReferenceType {
  MILESTONE = 'milestone',
  SPONSORSHIP = 'sponsorship',
  REWARD = 'reward',
  PURCHASE = 'purchase',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
}

@Entity('token_ledger_entries')
@Index(['userId', 'createdAt'])
export class TokenLedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: TokenTransactionType,
  })
  type: TokenTransactionType;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  balanceAfter: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  lockedBalanceBefore: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  lockedBalanceAfter: number;

  @Column({
    type: 'enum',
    enum: TokenReferenceType,
    nullable: true,
  })
  referenceType: TokenReferenceType;

  @Column({ nullable: true })
  referenceId: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  txHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
