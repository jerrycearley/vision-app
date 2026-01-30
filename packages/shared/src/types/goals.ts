// Goals, Roadmaps, and Milestones Types

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetDate?: Date;
  status: GoalStatus;
  priority: number;
  parentGoalId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum GoalCategory {
  EDUCATION = 'education',
  CAREER = 'career',
  SKILL = 'skill',
  HEALTH = 'health',
  FINANCIAL = 'financial',
  PERSONAL = 'personal',
  SOCIAL = 'social',
  CREATIVE = 'creative',
  OTHER = 'other'
}

export enum GoalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  ABANDONED = 'abandoned'
}

export interface Roadmap {
  id: string;
  userId: string;
  goalId: string;
  title: string;
  description?: string;
  milestones: Milestone[];
  estimatedDuration?: string;
  aiGenerated: boolean;
  aiModelUsed?: string;
  status: RoadmapStatus;
  startDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum RoadmapStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface Milestone {
  id: string;
  roadmapId: string;
  title: string;
  description?: string;
  order: number;
  status: MilestoneStatus;
  dueDate?: Date;
  completedAt?: Date;
  resources: Resource[];
  tokenReward?: number;
  verificationRequired: boolean;
  verificationMethod?: VerificationMethod;
  createdAt: Date;
  updatedAt: Date;
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

export enum VerificationMethod {
  SELF_REPORT = 'self_report',
  GUARDIAN_APPROVAL = 'guardian_approval',
  CERTIFICATE = 'certificate',
  QUIZ = 'quiz',
  PROJECT = 'project',
  EXTERNAL = 'external'
}

export interface Resource {
  id: string;
  milestoneId: string;
  type: ResourceType;
  title: string;
  url?: string;
  description?: string;
  isFree: boolean;
  estimatedTime?: string;
  provider?: string;
  createdAt: Date;
}

export enum ResourceType {
  ARTICLE = 'article',
  VIDEO = 'video',
  COURSE = 'course',
  BOOK = 'book',
  TOOL = 'tool',
  COMMUNITY = 'community',
  MENTOR = 'mentor',
  EVENT = 'event',
  OTHER = 'other'
}
