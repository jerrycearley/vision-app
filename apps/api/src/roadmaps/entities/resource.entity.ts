import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Milestone } from './milestone.entity';

export enum ResourceType {
  ARTICLE = 'article',
  VIDEO = 'video',
  COURSE = 'course',
  BOOK = 'book',
  TOOL = 'tool',
  COMMUNITY = 'community',
  MENTOR = 'mentor',
  EVENT = 'event',
  OTHER = 'other',
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  milestoneId: string;

  @ManyToOne(() => Milestone, (milestone) => milestone.resources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'milestoneId' })
  milestone: Milestone;

  @Column({
    type: 'enum',
    enum: ResourceType,
    default: ResourceType.OTHER,
  })
  type: ResourceType;

  @Column()
  title: string;

  @Column({ nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isFree: boolean;

  @Column({ nullable: true })
  estimatedTime: string;

  @Column({ nullable: true })
  provider: string;

  @CreateDateColumn()
  createdAt: Date;
}
