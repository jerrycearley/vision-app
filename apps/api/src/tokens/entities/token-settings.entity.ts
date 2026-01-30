import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('token_settings')
export class TokenSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Vision Token' })
  tokenName: string;

  @Column({ default: 'VSN' })
  tokenSymbol: string;

  @Column({ nullable: true })
  contractAddress: string;

  @Column({ type: 'int', nullable: true })
  chainId: number;

  @Column({ nullable: true })
  chainName: string;

  @Column({ type: 'int', default: 18 })
  decimals: number;

  @Column({ default: true })
  minorLockEnabled: boolean;

  @Column({ type: 'int', default: 365 })
  defaultLockDurationDays: number;

  @Column({ default: false })
  onChainEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
