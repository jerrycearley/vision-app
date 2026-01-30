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

@Entity('consent_records')
export class ConsentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  connectorType: string;

  @Column('simple-array')
  scopes: string[];

  @Column('simple-array')
  dataCategories: string[];

  @Column({ type: 'timestamp' })
  consentGivenAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ default: false })
  guardianApprovalRequired: boolean;

  @Column({ type: 'timestamp', nullable: true })
  guardianApprovedAt: Date;

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
