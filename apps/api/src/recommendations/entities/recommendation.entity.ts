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

export enum RecommendationType {
  ACTIVITY = 'activity',
  EVENT = 'event',
  COURSE = 'course',
  CAREER = 'career',
  SCHOOL = 'school',
  COMMUNITY = 'community',
  CONTENT = 'content',
  OPPORTUNITY = 'opportunity',
}

export enum RecommendationCategory {
  EDUCATION = 'education',
  CAREER = 'career',
  HOBBY = 'hobby',
  SOCIAL = 'social',
  HEALTH = 'health',
  ENTERTAINMENT = 'entertainment',
  VOLUNTEER = 'volunteer',
  SKILL_BUILDING = 'skill_building',
}

export enum RecommendationSource {
  AI_GENERATED = 'ai_generated',
  CURATED = 'curated',
  SPONSOR = 'sponsor',
  COMMUNITY = 'community',
  PARTNER = 'partner',
}

export enum RecommendationStatus {
  ACTIVE = 'active',
  VIEWED = 'viewed',
  SAVED = 'saved',
  DISMISSED = 'dismissed',
  EXPIRED = 'expired',
}

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: RecommendationType,
  })
  type: RecommendationType;

  @Column({
    type: 'enum',
    enum: RecommendationCategory,
  })
  category: RecommendationCategory;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float', default: 0 })
  relevanceScore: number;

  @Column({ type: 'text', nullable: true })
  reasoning: string;

  @Column({
    type: 'enum',
    enum: RecommendationSource,
    default: RecommendationSource.AI_GENERATED,
  })
  source: RecommendationSource;

  @Column({ nullable: true })
  externalId: string;

  @Column({ nullable: true })
  externalUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  location: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    virtual: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  dateInfo: {
    startDate?: Date;
    endDate?: Date;
    recurring: boolean;
    recurrencePattern?: string;
    deadlineDate?: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  pricing: {
    isFree: boolean;
    price?: number;
    currency?: string;
    priceRange?: string;
    scholarshipAvailable?: boolean;
  };

  @Column({
    type: 'enum',
    enum: RecommendationStatus,
    default: RecommendationStatus.ACTIVE,
  })
  status: RecommendationStatus;

  @Column({ type: 'jsonb', nullable: true })
  userFeedback: {
    rating?: number;
    liked?: boolean;
    notes?: string;
    givenAt?: Date;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
