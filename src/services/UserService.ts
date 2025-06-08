import { prisma } from "../lib/prisma";
import { User, Prisma } from "@prisma/client";

export class UserService {
  async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    balance?: number;
  }): Promise<User> {
    return await prisma.user.create({
      data: {
        ...userData,
        name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : userData.firstName || userData.lastName,
        balance: userData.balance || 5000
      }
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        trades: true,
        tradingSessions: true
      }
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<User | null> {
    return await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance }
    });
  }

  async updateUserStats(userId: string, stats: {
    totalProfit?: number;
    totalLoss?: number;
    totalTrades?: number;
    winningTrades?: number;
    losingTrades?: number;
  }): Promise<User | null> {
    return await prisma.user.update({
      where: { id: userId },
      data: stats
    });
  }

  async getUserStats(userId: string): Promise<{
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalProfit: number;
    totalLoss: number;
    netProfitLoss: number;
    balance: number;
  } | null> {
    const user = await this.findUserById(userId);
    if (!user) return null;

    const winRate = user.totalTrades > 0 ? (user.winningTrades / user.totalTrades) * 100 : 0;

    return {
      totalTrades: user.totalTrades,
      winningTrades: user.winningTrades,
      losingTrades: user.losingTrades,
      winRate,
      totalProfit: Number(user.totalProfit),
      totalLoss: Number(user.totalLoss),
      netProfitLoss: Number(user.totalProfit) - Number(user.totalLoss),
      balance: Number(user.balance)
    };
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}