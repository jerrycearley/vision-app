// Sponsorship System Types

export interface Sponsor {
  id: string;
  userId: string;
  organizationName?: string;
  type: SponsorType;
  status: SponsorStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  totalContributed: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum SponsorType {
  INDIVIDUAL = 'individual',
  FAMILY = 'family',
  ORGANIZATION = 'organization',
  CORPORATE = 'corporate'
}

export enum SponsorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export interface SponsorshipLedgerEntry {
  id: string;
  sponsorId: string;
  beneficiaryId?: string;
  type: SponsorshipTransactionType;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  status: PaymentStatus;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum SponsorshipTransactionType {
  CONTRIBUTION = 'contribution',
  SUBSCRIPTION_PAYMENT = 'subscription_payment',
  REFUND = 'refund',
  ALLOCATION = 'allocation',
  PAYOUT = 'payout'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export interface Sponsorship {
  id: string;
  sponsorId: string;
  beneficiaryId: string;
  type: SponsorshipType;
  status: SponsorshipStatus;
  monthlyAmount?: number;
  totalPledged?: number;
  totalDistributed: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  goalId?: string;
  milestoneRewards: MilestoneRewardConfig[];
  createdAt: Date;
  updatedAt: Date;
}

export enum SponsorshipType {
  MONTHLY = 'monthly',
  ONE_TIME = 'one_time',
  MILESTONE_BASED = 'milestone_based',
  GOAL_BASED = 'goal_based'
}

export enum SponsorshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface MilestoneRewardConfig {
  milestoneId: string;
  tokenAmount: number;
  cashAmount?: number;
  currency?: string;
  claimed: boolean;
  claimedAt?: Date;
}

export interface SubscriptionEntitlement {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  features: SubscriptionFeature[];
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  INCOMPLETE = 'incomplete',
  TRIALING = 'trialing'
}

export interface SubscriptionFeature {
  name: string;
  enabled: boolean;
  limit?: number;
  used?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  features: SubscriptionFeature[];
  isDefault: boolean;
  createdAt: Date;
}

export interface CreateCheckoutSessionRequest {
  planId: string;
  billingInterval: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CreateContributionRequest {
  amount: number;
  currency: string;
  beneficiaryId?: string;
  goalId?: string;
  message?: string;
}

export interface ContributionResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}
