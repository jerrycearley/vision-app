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
import { Roadmap } from './roadmap.entity';
import { Resource } from './resource.entity';

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export enum VerificationMethod {
  SELF_REPORT = 'self_report',
  GUARDIAN_APPROVAL = 'guardian_approval',
  CERTIFICATE = 'certificate',
  QUIZ = 'quiz',
  PROJECT = 'project',
  EXTERNAL = 'external',
}

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roadmapId: string;

  @ManyToOne(() => Roadmap, (roadmap) => roadmap.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roadmapId' })
  roadmap: Roadmap;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({
    type: 'enum',
    enum: MilestoneStatus,
    default: MilestoneStatus.PENDING,
  })
  status: MilestoneStatus;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  tokenReward: number;

  @Column({ default: false })
  verificationRequired: boolean;

  @Column({
    type: 'enum',
    enum: VerificationMethod,
    nullable: true,
  })
  verificationMethod: VerificationMethod;

  @Column({ nullable: true })
  estimatedDuration: string;

  @Column('simple-array', { default: '' })
  skills: string[];

  @OneToMany(() => Resource, (resource) => resource.milestone, { cascade: true })
  resources: Resource[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
