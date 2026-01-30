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
import { Goal } from '../../goals/entities/goal.entity';
import { Milestone } from './milestone.entity';

export enum RoadmapStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Entity('roadmaps')
export class Roadmap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  goalId: string;

  @ManyToOne(() => Goal, (goal) => goal.roadmaps)
  @JoinColumn({ name: 'goalId' })
  goal: Goal;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  estimatedDuration: string;

  @Column({ default: false })
  aiGenerated: boolean;

  @Column({ nullable: true })
  aiModelUsed: string;

  @Column({
    type: 'enum',
    enum: RoadmapStatus,
    default: RoadmapStatus.DRAFT,
  })
  status: RoadmapStatus;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @OneToMany(() => Milestone, (milestone) => milestone.roadmap, { cascade: true })
  milestones: Milestone[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
