import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@binarypro.com' },
    update: {},
    create: {
      email: 'admin@binarypro.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      role: 'ADMIN',
      balance: 10000,
      hasReceivedWelcomeBonus: true,
      authProvider: 'EMAIL',
      emailVerified: new Date(),
    },
  })

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@binarypro.com' },
    update: {},
    create: {
      email: 'demo@binarypro.com',
      password: demoPassword,
      firstName: 'Demo',
      lastName: 'User',
      name: 'Demo User',
      role: 'USER',
      balance: 5000,
      hasReceivedWelcomeBonus: true,
      authProvider: 'EMAIL',
      emailVerified: new Date(),
    },
  })

  // Create some sample trades for demo user
  const sampleTrades = [
    {
      userId: demoUser.id,
      symbol: 'EURUSD',
      direction: 'HIGHER' as const,
      entryPrice: 1.0850,
      exitPrice: 1.0865,
      amount: 100,
      profitPercentage: 85,
      payout: 185,
      expirySeconds: 30,
      expiryTime: new Date(Date.now() - 60000), // 1 minute ago
      status: 'COMPLETED' as const,
      result: 'WON' as const,
      completedAt: new Date(Date.now() - 30000),
      metadata: {
        marketTrend: 'bullish',
        riskLevel: 'medium'
      }
    },
    {
      userId: demoUser.id,
      symbol: 'GBPUSD',
      direction: 'LOWER' as const,
      entryPrice: 1.2650,
      exitPrice: 1.2640,
      amount: 50,
      profitPercentage: 85,
      payout: 92.5,
      expirySeconds: 60,
      expiryTime: new Date(Date.now() - 120000), // 2 minutes ago
      status: 'COMPLETED' as const,
      result: 'WON' as const,
      completedAt: new Date(Date.now() - 60000),
      metadata: {
        marketTrend: 'bearish',
        riskLevel: 'low'
      }
    }
  ]

  for (const trade of sampleTrades) {
    await prisma.trade.create({ data: trade })
  }

  // Update demo user stats
  await prisma.user.update({
    where: { id: demoUser.id },
    data: {
      totalTrades: 2,
      winningTrades: 2,
      losingTrades: 0,
      totalProfit: 127.5, // (185-100) + (92.5-50)
      totalLoss: 0,
      balance: 5127.5 // 5000 + 127.5
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user: admin@binarypro.com / admin123')
  console.log('👤 Demo user: demo@binarypro.com / demo123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })