// AI System Types

export interface AIProvider {
  name: string;
  generateRoadmap(request: RoadmapGenerationRequest): Promise<RoadmapGenerationResponse>;
  generateRecommendations(request: RecommendationGenerationRequest): Promise<RecommendationGenerationResponse>;
  explainRecommendation(request: ExplanationRequest): Promise<ExplanationResponse>;
  generateEmbedding?(text: string): Promise<number[]>;
}

export interface RoadmapGenerationRequest {
  goal: string;
  userProfile: UserProfileContext;
  contextEvents?: ContextEvent[];
  preferences?: RoadmapPreferences;
}

export interface RoadmapGenerationResponse {
  success: boolean;
  roadmap?: GeneratedRoadmap;
  error?: string;
  provider: string;
  tokensUsed?: number;
}

export interface GeneratedRoadmap {
  title: string;
  description: string;
  estimatedDuration: string;
  milestones: GeneratedMilestone[];
  prerequisites?: string[];
  tips?: string[];
}

export interface GeneratedMilestone {
  title: string;
  description: string;
  estimatedDuration: string;
  resources: GeneratedResource[];
  skills: string[];
  verificationSuggestion: string;
}

export interface GeneratedResource {
  title: string;
  type: string;
  url?: string;
  description: string;
  isFree: boolean;
}

export interface RecommendationGenerationRequest {
  userProfile: UserProfileContext;
  contextEvents?: ContextEvent[];
  category?: string;
  count?: number;
  excludeIds?: string[];
}

export interface RecommendationGenerationResponse {
  success: boolean;
  recommendations: GeneratedRecommendation[];
  error?: string;
  provider: string;
  tokensUsed?: number;
}

export interface GeneratedRecommendation {
  type: string;
  category: string;
  title: string;
  description: string;
  relevanceScore: number;
  reasoning: string;
  actionUrl?: string;
  tags?: string[];
}

export interface ExplanationRequest {
  recommendation: {
    id: string;
    title: string;
    description: string;
    category: string;
    reasoning?: string;
  };
  userProfile: UserProfileContext;
}

export interface ExplanationResponse {
  success: boolean;
  explanation?: string;
  relatedInterests?: string[];
  alternativeSuggestions?: string[];
  error?: string;
  provider: string;
}

export interface UserProfileContext {
  interests: string[];
  skills: string[];
  goals: string[];
  educationLevel?: string;
  age?: number;
  recentActivities?: string[];
  preferences?: Record<string, any>;
}

export interface ContextEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface RoadmapPreferences {
  maxDuration?: string;
  preferFreeResources?: boolean;
  learningStyle?: LearningStyle;
  pacePreference?: PacePreference;
}

export enum LearningStyle {
  VISUAL = 'visual',
  READING = 'reading',
  HANDS_ON = 'hands_on',
  MIXED = 'mixed'
}

export enum PacePreference {
  INTENSIVE = 'intensive',
  MODERATE = 'moderate',
  RELAXED = 'relaxed'
}

export interface AIConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AIAssistantState {
  conversationHistory: AIConversationMessage[];
  inferredInterests: string[];
  suggestedGoals: string[];
  pendingQuestions: string[];
  userConfirmations: Record<string, boolean>;
}
