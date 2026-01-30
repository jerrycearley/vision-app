// Recommendations Types

export interface Recommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  category: RecommendationCategory;
  title: string;
  description: string;
  relevanceScore: number;
  reasoning?: string;
  source: RecommendationSource;
  externalId?: string;
  externalUrl?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
  location?: LocationInfo;
  dateInfo?: DateInfo;
  pricing?: PricingInfo;
  status: RecommendationStatus;
  userFeedback?: UserFeedback;
  createdAt: Date;
  updatedAt: Date;
}

export enum RecommendationType {
  ACTIVITY = 'activity',
  EVENT = 'event',
  COURSE = 'course',
  CAREER = 'career',
  SCHOOL = 'school',
  COMMUNITY = 'community',
  CONTENT = 'content',
  OPPORTUNITY = 'opportunity'
}

export enum RecommendationCategory {
  EDUCATION = 'education',
  CAREER = 'career',
  HOBBY = 'hobby',
  SOCIAL = 'social',
  HEALTH = 'health',
  ENTERTAINMENT = 'entertainment',
  VOLUNTEER = 'volunteer',
  SKILL_BUILDING = 'skill_building'
}

export enum RecommendationSource {
  AI_GENERATED = 'ai_generated',
  CURATED = 'curated',
  SPONSOR = 'sponsor',
  COMMUNITY = 'community',
  PARTNER = 'partner'
}

export enum RecommendationStatus {
  ACTIVE = 'active',
  VIEWED = 'viewed',
  SAVED = 'saved',
  DISMISSED = 'dismissed',
  EXPIRED = 'expired'
}

export interface LocationInfo {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  virtual: boolean;
}

export interface DateInfo {
  startDate?: Date;
  endDate?: Date;
  recurring: boolean;
  recurrencePattern?: string;
  deadlineDate?: Date;
}

export interface PricingInfo {
  isFree: boolean;
  price?: number;
  currency?: string;
  priceRange?: string;
  scholarshipAvailable?: boolean;
}

export interface UserFeedback {
  rating?: number;
  liked?: boolean;
  notes?: string;
  givenAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  recommendationId: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
}
