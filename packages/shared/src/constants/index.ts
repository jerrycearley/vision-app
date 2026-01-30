export * from './connectors';
export * from './categories';

// Token Constants
export const TOKEN_DEFAULTS = {
  NAME: 'Vision Token',
  SYMBOL: 'VSN',
  DECIMALS: 18,
  MINOR_LOCK_DURATION_DAYS: 365, // 1 year default lock for minors
  MIN_WITHDRAWAL_AMOUNT: 10,
  MAX_DAILY_WITHDRAWAL: 1000
};

// Age Constants
export const AGE_CONSTANTS = {
  MINOR_AGE_THRESHOLD: 18,
  REQUIRE_GUARDIAN_AGE: 13,
  MIN_ACCOUNT_AGE: 13
};

// API Rate Limits
export const RATE_LIMITS = {
  AI_REQUESTS_PER_HOUR: 100,
  UPLOAD_REQUESTS_PER_DAY: 10,
  MAX_FILE_SIZE_MB: 10
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Milestone Token Rewards
export const DEFAULT_MILESTONE_REWARDS = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
  EPIC: 100
};
