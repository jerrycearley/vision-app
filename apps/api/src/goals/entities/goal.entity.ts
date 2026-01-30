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
import { Roadmap } from '../../roadmaps/entities/roadmap.entity';

export enum GoalCategory {
  EDUCATION = 'education',
  CAREER = 'career',
  SKILL = 'skill',
  HEALTH = 'health',
  FINANCIAL = 'financial',
  PERSONAL = 'personal',
  SOCIAL = 'social',
  CREATIVE = 'creative',
  OTHER = 'other',
}

export enum GoalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  ABANDONED = 'abandoned',
}

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.goals)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: GoalCategory,
    default: GoalCategory.OTHER,
  })
  category: GoalCategory;

  @Column({ type: 'date', nullable: true })
  targetDate: Date;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.DRAFT,
  })
  status: GoalStatus;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ nullable: true })
  parentGoalId: string;

  @ManyToOne(() => Goal, { nullable: true })
  @JoinColumn({ name: 'parentGoalId' })
  parentGoal: Goal;

  @Column('simple-array', { default: '' })
  tags: string[];

  @OneToMany(() => Roadmap, (roadmap) => roadmap.goal)
  roadmaps: Roadmap[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
