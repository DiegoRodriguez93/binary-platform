This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn dev
# or
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup with TypeORM and Neon

This project uses TypeORM with PostgreSQL (Neon) for data persistence.

### Prerequisites

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new database project
3. Get your connection string

### Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update the `DATABASE_URL` in `.env.local` with your Neon connection string:
```
DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Database Initialization

1. Install dependencies:
```bash
yarn install
```

2. Initialize the database connection:
```bash
# This will create the tables automatically in development
yarn dev
```

3. Or manually initialize via API:
```bash
curl -X POST http://localhost:3000/api/database/init
```

### Database Operations

#### Generate Migration
```bash
yarn migration:generate src/migrations/MigrationName
```

#### Run Migrations
```bash
yarn migration:run
```

#### Revert Migration
```bash
yarn migration:revert
```

### API Endpoints

#### Users
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user

#### Trades
- `POST /api/trades` - Create a new trade
- `GET /api/trades?userId=xxx` - Get trade history
- `GET /api/trades/active?userId=xxx` - Get active trades
- `PUT /api/trades/[id]/complete` - Complete a trade
- `GET /api/trades/stats?userId=xxx` - Get trade statistics

#### Database
- `GET /api/database/init` - Check database connection
- `POST /api/database/init` - Initialize database

### Example Usage

#### Create a User
```javascript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    balance: 1000
  })
});
```

#### Create a Trade
```javascript
const response = await fetch('/api/trades', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    symbol: 'EURUSD',
    direction: 'higher',
    entryPrice: 1.0850,
    amount: 100,
    profitPercentage: 85,
    expirySeconds: 30,
    metadata: {
      marketTrend: 'bullish',
      riskLevel: 'medium'
    }
  })
});
```

#### Complete a Trade
```javascript
const response = await fetch('/api/trades/trade-uuid/complete', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exitPrice: 1.0860
  })
});
```

### Database Schema

#### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String)
- `firstName` (String, Optional)
- `lastName` (String, Optional)
- `balance` (Decimal)
- `totalProfit` (Decimal)
- `totalLoss` (Decimal)
- `totalTrades` (Integer)
- `winningTrades` (Integer)
- `losingTrades` (Integer)
- `isActive` (Boolean)
- `role` (Enum: user, admin)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

#### Trades Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `symbol` (String)
- `direction` (Enum: higher, lower)
- `entryPrice` (Decimal)
- `exitPrice` (Decimal, Optional)
- `amount` (Decimal)
- `profitPercentage` (Decimal)
- `payout` (Decimal, Optional)
- `expirySeconds` (Integer)
- `expiryTime` (Timestamp)
- `status` (Enum: active, completed, cancelled)
- `result` (Enum: won, lost, pending)
- `metadata` (JSON, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `completedAt` (Timestamp, Optional)

#### Trading Sessions Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `startingBalance` (Decimal)
- `endingBalance` (Decimal, Optional)
- `totalTrades` (Integer)
- `winningTrades` (Integer)
- `losingTrades` (Integer)
- `totalProfit` (Decimal)
- `totalLoss` (Decimal)
- `maxDrawdown` (Decimal)
- `maxProfit` (Decimal)
- `tradedSymbols` (JSON Array)
- `sessionMetadata` (JSON)
- `isActive` (Boolean)
- `startedAt` (Timestamp)
- `updatedAt` (Timestamp)
- `endedAt` (Timestamp, Optional)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.