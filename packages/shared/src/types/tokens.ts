// Token System Types

export interface TokenSettings {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  contractAddress?: string;
  chainId?: number;
  chainName?: string;
  decimals: number;
  minorLockEnabled: boolean;
  defaultLockDurationDays: number;
  onChainEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenLedgerEntry {
  id: string;
  userId: string;
  type: TokenTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  lockedBalanceBefore: number;
  lockedBalanceAfter: number;
  referenceType?: TokenReferenceType;
  referenceId?: string;
  description: string;
  txHash?: string;
  createdAt: Date;
}

export enum TokenTransactionType {
  EARN = 'earn',
  SPEND = 'spend',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  MINT = 'mint',
  BURN = 'burn'
}

export enum TokenReferenceType {
  MILESTONE = 'milestone',
  SPONSORSHIP = 'sponsorship',
  REWARD = 'reward',
  PURCHASE = 'purchase',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit'
}

export interface TokenBalance {
  userId: string;
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
  pendingBalance: number;
  lockStatus?: TokenLockStatus;
  lastUpdatedAt: Date;
}

export interface TokenLockStatus {
  id: string;
  userId: string;
  isLocked: boolean;
  lockedAmount: number;
  lockReason: LockReason;
  lockStartDate: Date;
  unlockDate: Date;
  guardianApprovedEarlyUnlock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum LockReason {
  MINOR_PROTECTION = 'minor_protection',
  VESTING = 'vesting',
  STAKING = 'staking',
  GUARDIAN_REQUESTED = 'guardian_requested'
}

export interface TokenIssuanceRequest {
  userId: string;
  amount: number;
  reason: TokenReferenceType;
  referenceId: string;
  description: string;
  applyMinorLock: boolean;
}

export interface TokenIssuanceResult {
  success: boolean;
  ledgerEntryId?: string;
  newBalance?: TokenBalance;
  error?: string;
  locked?: boolean;
  unlockDate?: Date;
}

export interface TokenWithdrawalRequest {
  userId: string;
  amount: number;
  destinationAddress: string;
  guardianApprovalRequired: boolean;
  guardianApprovalId?: string;
}

export interface TokenWithdrawalResult {
  success: boolean;
  ledgerEntryId?: string;
  txHash?: string;
  error?: string;
  pendingGuardianApproval?: boolean;
}
