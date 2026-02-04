# Vision App

A full-stack monorepo application for personalized goal-setting, AI-powered roadmaps, and achievement rewards.

## Architecture

```
vision-app/
├── apps/
│   ├── api/          # NestJS backend API
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native (Expo) mobile app
├── packages/
│   ├── shared/       # Shared TypeScript types and constants
│   └── contracts/    # Solidity smart contracts (Sepolia)
├── docker/           # Docker configurations
└── scripts/          # Utility scripts
```

## Features

### Core Features
- **User Management**: Registration, authentication, profiles
- **Guardian System**: Parental controls for minors with consent management
- **Goal Setting**: Create and track personal goals
- **AI Roadmaps**: Gemini-powered personalized learning paths
- **Recommendations**: AI-generated activity and opportunity suggestions
- **Connectors**: Import interests from Google, file uploads, etc.
- **Token System**: Earn VSN tokens for completing milestones
- **Minor Protection**: Locked tokens until age 18
- **Sponsorship**: Stripe-powered contribution system

### AI System
- **Gemini Integration**: Default AI provider (requires API key)
- **Mock Provider**: Deterministic outputs when no API key configured
- **Endpoints**:
  - `POST /ai/roadmap` - Generate goal roadmap
  - `POST /ai/recommendations` - Generate personalized recommendations
  - `POST /ai/explain` - Explain recommendation relevance
  - `POST /ai/chat` - Interactive AI assistant
  - `GET /ai/infer-interests` - Analyze connected data sources

### Connectors
- **Google OAuth** (working MVP)
- **Upload Import** (working MVP - CSV, JSON, text)
- **Spotify, Discord, Instagram, Twitter** (stubs)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure required variables:
```bash
# Database (defaults work with Docker)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=vision
DATABASE_PASSWORD=vision_password
DATABASE_NAME=vision_db

# JWT (change in production!)
JWT_SECRET=your-super-secret-jwt-key

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Optional: Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Using Docker (Development)

```bash
# Start all services (dev)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services (dev):
- API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs
- Web: http://localhost:3000
- PostgreSQL: localhost:5432

### Production-ish (LAN) Docker

This runs optimized builds and binds to your LAN IP (not 0.0.0.0).

1) Copy and edit env:
```bash
cp .env.prod.example .env.prod
# edit JWT_SECRET and DATABASE_PASSWORD at minimum
```

2) Start:
```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

3) Access from phone/laptop on Wi-Fi:
- Web: http://192.168.1.70:3000
- API: http://192.168.1.70:4000

Notes:
- DB/Redis are not published to host.
- API runs migrations on container start.

### Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Build shared package:
```bash
cd packages/shared && npm run build
```

3. Set up database:
```bash
# Start PostgreSQL (or use Docker just for DB)
docker-compose up -d db

# Run migrations
cd apps/api
npm run migration:run

# Seed database
npm run seed
```

4. Start development servers:
```bash
# API (from apps/api)
npm run dev

# Web (from apps/web)
npm run dev

# Mobile (from apps/mobile)
npm start
```

## Test Accounts

After seeding the database:

| Email | Password | Type |
|-------|----------|------|
| adult@test.com | password123 | Adult user |
| minor@test.com | password123 | Minor (with guardian) |
| guardian@test.com | password123 | Guardian of minor |

## API Documentation

Interactive API docs available at: http://localhost:4000/api/docs

### Main Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/privy` - Authenticate with Privy
- `GET /api/v1/auth/me` - Get current user

#### Users
- `GET /api/v1/users/profile` - Get profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/interests` - Get aggregated interests

#### Goals
- `GET /api/v1/goals` - List goals
- `POST /api/v1/goals` - Create goal
- `PUT /api/v1/goals/:id` - Update goal
- `DELETE /api/v1/goals/:id` - Delete goal

#### Roadmaps
- `POST /api/v1/roadmaps/generate` - Generate from goal
- `GET /api/v1/roadmaps` - List roadmaps
- `POST /api/v1/roadmaps/:id/milestones/:mid/complete` - Complete milestone

#### Connectors
- `GET /api/v1/connectors/available` - List available connectors
- `POST /api/v1/connectors/oauth/initiate` - Start OAuth flow
- `POST /api/v1/connectors/upload` - Import from file

#### Tokens
- `GET /api/v1/tokens/balance` - Get balance
- `GET /api/v1/tokens/history` - Transaction history
- `POST /api/v1/tokens/transfer` - Transfer tokens (adults only)
- `GET /api/v1/tokens/verify-integrity` - Verify ledger

#### Sponsorship
- `POST /api/v1/sponsorship/contribute` - Make contribution
- `GET /api/v1/sponsorship/ledger` - View ledger history

## Running Tests

```bash
# API tests
cd apps/api
npm run test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Authentication flow
- Parental consent gating
- Milestone completion → token issuance
- Minor token lock enforcement
- Ledger integrity verification

## Smart Contract (Optional)

The VSN token contract is on Sepolia testnet and **disabled by default**.

To enable:
1. Deploy contract: `cd packages/contracts && npm run deploy`
2. Set `BLOCKCHAIN_ENABLED=true` in .env
3. Configure `TOKEN_CONTRACT_ADDRESS`

## Project Structure

### Apps

#### API (`apps/api`)
- NestJS with TypeORM
- PostgreSQL database
- JWT authentication
- Swagger documentation

#### Web (`apps/web`)
- Next.js 14 with App Router
- TailwindCSS styling
- React Query for data fetching
- Zustand for state management

#### Mobile (`apps/mobile`)
- Expo with expo-router
- React Native components
- Secure token storage

### Packages

#### Shared (`packages/shared`)
- TypeScript type definitions
- Constants and configurations
- Connector configurations

#### Contracts (`packages/contracts`)
- VisionToken ERC-20 contract
- Hardhat for development
- Sepolia testnet deployment

## Configuration

### Feature Flags
```bash
AI_ENABLED=true           # Enable AI features
TOKENS_ENABLED=true       # Enable token system
BLOCKCHAIN_ENABLED=false  # Enable on-chain tokens
SPONSORSHIP_ENABLED=true  # Enable sponsorship
```

### Maps
```bash
MAPS_PROVIDER=mapbox      # or 'google'
MAPS_API_KEY=your-api-key
```

### Privy (Crypto Auth)
```bash
PRIVY_APP_ID=your-app-id
PRIVY_APP_SECRET=your-secret
```

## Development

### Adding a New Connector

1. Add type to `packages/shared/src/types/connector.ts`
2. Add config to `packages/shared/src/constants/connectors.ts`
3. Create service in `apps/api/src/connectors/services/`
4. Register in `ConnectorsModule`

### Adding AI Providers

1. Create provider in `apps/api/src/ai/providers/`
2. Implement the interface methods
3. Add fallback logic in `AIService`

## Disclaimers

- Token features are for educational purposes
- Blockchain features are disabled by default
- Always use test keys for Stripe
- Minor protection features require proper legal review

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
