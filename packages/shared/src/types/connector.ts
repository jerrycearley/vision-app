// Connector and Interest Signal Types

export interface Connector {
  id: string;
  userId: string;
  type: ConnectorType;
  status: ConnectorStatus;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  scopes: string[];
  lastSyncAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum ConnectorType {
  GOOGLE = 'google',
  SPOTIFY = 'spotify',
  YOUTUBE = 'youtube',
  DISCORD = 'discord',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  UPLOAD = 'upload',
  MANUAL = 'manual'
}

export enum ConnectorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ERROR = 'error',
  DISCONNECTED = 'disconnected'
}

export interface ConnectorConfig {
  type: ConnectorType;
  name: string;
  description: string;
  icon: string;
  availableScopes: ConnectorScope[];
  dataCategories: DataCategoryInfo[];
  oauthUrl?: string;
  supportsUpload: boolean;
}

export interface ConnectorScope {
  scope: string;
  name: string;
  description: string;
  required: boolean;
}

export interface DataCategoryInfo {
  category: string;
  name: string;
  description: string;
  examples: string[];
}

export interface InterestSignal {
  id: string;
  userId: string;
  source: ConnectorType;
  sourceId?: string;
  timestamp: Date;
  topic: string;
  entity?: string;
  entityType?: EntityType;
  weight: number;
  confidence: number;
  rawMetadata?: Record<string, any>;
  createdAt: Date;
}

export enum EntityType {
  TOPIC = 'topic',
  PERSON = 'person',
  ORGANIZATION = 'organization',
  PLACE = 'place',
  EVENT = 'event',
  MEDIA = 'media',
  PRODUCT = 'product',
  SKILL = 'skill',
  CAREER = 'career',
  HOBBY = 'hobby'
}

export interface UploadImportRequest {
  userId: string;
  fileType: UploadFileType;
  fileName: string;
  fileContent: string;
  metadata?: Record<string, any>;
}

export enum UploadFileType {
  CSV = 'csv',
  JSON = 'json',
  TEXT = 'text'
}

export interface ImportResult {
  success: boolean;
  signalsCreated: number;
  errors?: string[];
  warnings?: string[];
}

import { DataCategory } from './user';
export { DataCategory };
