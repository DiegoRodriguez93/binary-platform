# BinaryPro - Advanced Binary Trading Platform

This is a [Next.js](https://nextjs.org) project with Prisma and PostgreSQL for binary options trading.

## Getting Started

First, install dependencies:

```bash
yarn install
```

## Database Setup with Prisma and Neon

This project uses Prisma with PostgreSQL (Neon) for data persistence.

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

1. Generate Prisma client:
```bash
yarn db:generate
```

2. Push the schema to your database:
```bash
yarn db:push
```

3. Seed the database with sample data:
```bash
yarn db:seed
```

4. Start the development server:
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database Commands

#### Generate Prisma Client
```bash
yarn db:generate
```

#### Push Schema Changes
```bash
yarn db:push
```

#### Create and Run Migrations
```bash
yarn db:migrate
```

#### Open Prisma Studio
```bash
yarn db:studio
```

#### Seed Database
```bash
yarn db:seed
```

### Demo Accounts

After seeding, you can use these accounts:

- **Admin**: admin@binarypro.com / admin123
- **Demo User**: demo@binarypro.com / demo123

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/signin` - Sign in (handled by NextAuth)

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
- `POST /api/database/init` - Test database connection

### Features

- 🔐 **Authentication**: NextAuth.js with email/password, Google, and Twitter
- 💰 **$5000 Welcome Bonus**: New users receive a welcome bonus
- 📊 **Real-time Trading**: Advanced trading interface with ApexCharts
- 📱 **Responsive Design**: Works on all devices
- 🎨 **Modern UI**: Beautiful design with Tailwind CSS and SCSS
- 🔒 **Secure**: Password hashing, session management
- 📈 **Analytics**: Trade statistics and performance tracking

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, SCSS
- **Database**: PostgreSQL (Neon), Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: ApexCharts
- **Icons**: Lucide React
- **Forms**: React Hook Form, Zod validation

### Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utilities and configurations
├── services/           # Business logic services
├── styles/             # SCSS styles
└── types/              # TypeScript type definitions

prisma/
├── schema.prisma       # Database schema
└── seed.ts            # Database seeding script
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.