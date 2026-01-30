// User and Authentication Types

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  isMinor: boolean;
  privyDid?: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  interests: string[];
  skills: string[];
  educationLevel?: EducationLevel;
  careerGoals: string[];
  hobbies: string[];
  location?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EducationLevel {
  ELEMENTARY = 'elementary',
  MIDDLE_SCHOOL = 'middle_school',
  HIGH_SCHOOL = 'high_school',
  UNDERGRADUATE = 'undergraduate',
  GRADUATE = 'graduate',
  PROFESSIONAL = 'professional',
  OTHER = 'other'
}

export interface GuardianshipLink {
  id: string;
  guardianId: string;
  minorId: string;
  relationship: GuardianRelationship;
  status: GuardianshipStatus;
  consentGivenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum GuardianRelationship {
  PARENT = 'parent',
  LEGAL_GUARDIAN = 'legal_guardian',
  OTHER = 'other'
}

export enum GuardianshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REVOKED = 'revoked'
}

export interface ConsentRecord {
  id: string;
  userId: string;
  connectorType: string;
  scopes: string[];
  dataCategories: DataCategory[];
  consentGivenAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  guardianApprovalRequired: boolean;
  guardianApprovedAt?: Date;
  guardianId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DataCategory {
  PROFILE = 'profile',
  INTERESTS = 'interests',
  ACTIVITY = 'activity',
  LOCATION = 'location',
  CONTACTS = 'contacts',
  CALENDAR = 'calendar',
  MEDIA = 'media',
  FINANCIAL = 'financial'
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  user: User;
}
