import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('token_balances')
export class TokenBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.tokenBalance)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  availableBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  lockedBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  pendingBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
