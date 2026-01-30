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

export enum GuardianRelationship {
  PARENT = 'parent',
  LEGAL_GUARDIAN = 'legal_guardian',
  OTHER = 'other',
}

export enum GuardianshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REVOKED = 'revoked',
}

@Entity('guardianship_links')
export class GuardianshipLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  guardianId: string;

  @Column()
  minorId: string;

  @ManyToOne(() => User, (user) => user.guardiansOf)
  @JoinColumn({ name: 'guardianId' })
  guardian: User;

  @ManyToOne(() => User, (user) => user.guardians)
  @JoinColumn({ name: 'minorId' })
  minor: User;

  @Column({
    type: 'enum',
    enum: GuardianRelationship,
    default: GuardianRelationship.PARENT,
  })
  relationship: GuardianRelationship;

  @Column({
    type: 'enum',
    enum: GuardianshipStatus,
    default: GuardianshipStatus.PENDING,
  })
  status: GuardianshipStatus;

  @Column({ type: 'timestamp', nullable: true })
  consentGivenAt: Date;

  @Column({ type: 'varchar', nullable: true })
  invitationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  invitationExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
