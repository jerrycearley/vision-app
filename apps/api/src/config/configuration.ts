export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'vision',
    password: process.env.DATABASE_PASSWORD || 'vision_password',
    database: process.env.DATABASE_NAME || 'vision_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  },

  privy: {
    appId: process.env.PRIVY_APP_ID || '',
    appSecret: process.env.PRIVY_APP_SECRET || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-pro',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  blockchain: {
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
    network: process.env.BLOCKCHAIN_NETWORK || 'sepolia',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || '',
    contractAddress: process.env.TOKEN_CONTRACT_ADDRESS || '',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
  },

  maps: {
    provider: process.env.MAPS_PROVIDER || 'mapbox',
    apiKey: process.env.MAPS_API_KEY || '',
  },

  features: {
    aiEnabled: process.env.AI_ENABLED !== 'false',
    tokensEnabled: process.env.TOKENS_ENABLED !== 'false',
    blockchainEnabled: process.env.BLOCKCHAIN_ENABLED === 'true',
    sponsorshipEnabled: process.env.SPONSORSHIP_ENABLED !== 'false',
  },
});
