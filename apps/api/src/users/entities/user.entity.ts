import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { GuardianshipLink } from '../../guardians/entities/guardianship-link.entity';
import { Connector } from '../../connectors/entities/connector.entity';
import { Goal } from '../../goals/entities/goal.entity';
import { TokenBalance } from '../../tokens/entities/token-balance.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ default: false })
  isMinor: boolean;

  @Column({ nullable: true })
  privyDid: string;

  @Column({ nullable: true })
  walletAddress: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  @OneToMany(() => GuardianshipLink, (link) => link.guardian)
  guardiansOf: GuardianshipLink[];

  @OneToMany(() => GuardianshipLink, (link) => link.minor)
  guardians: GuardianshipLink[];

  @OneToMany(() => Connector, (connector) => connector.user)
  connectors: Connector[];

  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];

  @OneToOne(() => TokenBalance, (balance) => balance.user)
  tokenBalance: TokenBalance;
}
