// API Request/Response Types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  dateOfBirth?: string;
}

export interface PrivyAuthRequest {
  privyToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    displayName: string;
    isMinor: boolean;
    hasGuardian: boolean;
  };
}

// Profile API
export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  interests?: string[];
  skills?: string[];
  educationLevel?: string;
  careerGoals?: string[];
  hobbies?: string[];
  location?: string;
  timezone?: string;
}

// Goals API
export interface CreateGoalRequest {
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  priority?: number;
  parentGoalId?: string;
  tags?: string[];
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  category?: string;
  targetDate?: string;
  status?: string;
  priority?: number;
  tags?: string[];
}

// Roadmap API
export interface GenerateRoadmapRequest {
  goalId: string;
  preferences?: {
    maxDuration?: string;
    preferFreeResources?: boolean;
    learningStyle?: string;
    pacePreference?: string;
  };
}

export interface UpdateMilestoneRequest {
  status?: string;
  completedAt?: string;
  notes?: string;
}

// Connector API
export interface ConnectOAuthRequest {
  connectorType: string;
  authorizationCode: string;
  redirectUri: string;
  scopes: string[];
}

export interface UploadDataRequest {
  fileType: string;
  fileName: string;
  content: string;
  dataCategory: string;
}

export interface ConsentRequest {
  connectorType: string;
  scopes: string[];
  dataCategories: string[];
}

// Recommendations API
export interface GetRecommendationsRequest extends PaginationParams {
  category?: string;
  type?: string;
  includeViewed?: boolean;
}

export interface SaveRecommendationRequest {
  recommendationId: string;
  notes?: string;
  tags?: string[];
}

export interface RecommendationFeedbackRequest {
  recommendationId: string;
  rating?: number;
  liked?: boolean;
  feedback?: string;
}

// Sponsorship API
export interface CreateSponsorshipRequest {
  beneficiaryId: string;
  type: string;
  monthlyAmount?: number;
  totalPledged?: number;
  goalId?: string;
  milestoneRewards?: Array<{
    milestoneId: string;
    tokenAmount: number;
    cashAmount?: number;
  }>;
}

// Guardian API
export interface InviteGuardianRequest {
  guardianEmail: string;
  relationship: string;
  message?: string;
}

export interface GuardianConsentRequest {
  actionType: string;
  resourceId: string;
  approved: boolean;
  notes?: string;
}

// Token API
export interface WithdrawTokensRequest {
  amount: number;
  destinationAddress: string;
}

export interface TransferTokensRequest {
  recipientId: string;
  amount: number;
  notes?: string;
}
