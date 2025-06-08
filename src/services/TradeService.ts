import { prisma } from "../lib/prisma";
import { Trade, TradeDirection, TradeStatus, TradeResult } from "@prisma/client";

export class TradeService {
  async createTrade(tradeData: {
    userId: string;
    symbol: string;
    direction: TradeDirection;
    entryPrice: number;
    amount: number;
    profitPercentage: number;
    expirySeconds: number;
    metadata?: any;
  }): Promise<Trade> {
    const expiryTime = new Date(Date.now() + (tradeData.expirySeconds * 1000));

    const trade = await prisma.trade.create({
      data: {
        ...tradeData,
        expiryTime,
        status: "ACTIVE",
        result: "PENDING"
      }
    });

    // Actualizar estadísticas del usuario
    await prisma.user.update({
      where: { id: tradeData.userId },
      data: {
        totalTrades: { increment: 1 }
      }
    });

    return trade;
  }

  async completeTrade(tradeId: string, exitPrice: number): Promise<Trade | null> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { user: true }
    });

    if (!trade || trade.status !== "ACTIVE") {
      return null;
    }

    const isWinning = trade.direction === "HIGHER" 
      ? exitPrice > Number(trade.entryPrice)
      : exitPrice < Number(trade.entryPrice);

    const result: TradeResult = isWinning ? "WON" : "LOST";
    const payout = isWinning ? Number(trade.amount) * (1 + Number(trade.profitPercentage) / 100) : 0;

    // Actualizar el trade
    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        exitPrice,
        status: "COMPLETED",
        result,
        payout,
        completedAt: new Date()
      },
      include: { user: true }
    });

    // Actualizar estadísticas del usuario
    const user = trade.user;
    if (isWinning) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          winningTrades: { increment: 1 },
          totalProfit: { increment: payout - Number(trade.amount) },
          balance: { increment: payout }
        }
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          losingTrades: { increment: 1 },
          totalLoss: { increment: Number(trade.amount) }
        }
      });
    }

    return updatedTrade;
  }

  async getActiveTrades(userId: string): Promise<Trade[]> {
    return await prisma.trade.findMany({
      where: { 
        userId, 
        status: "ACTIVE" 
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getTradeHistory(userId: string, page: number = 1, limit: number = 20): Promise<{
    trades: Trade[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.trade.count({ where: { userId } })
    ]);

    return {
      trades,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getExpiredTrades(): Promise<Trade[]> {
    return await prisma.trade.findMany({
      where: {
        status: "ACTIVE",
        expiryTime: { lte: new Date() }
      }
    });
  }

  async cancelTrade(tradeId: string): Promise<Trade | null> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId }
    });

    if (!trade || trade.status !== "ACTIVE") {
      return null;
    }

    return await prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: "CANCELLED",
        completedAt: new Date()
      }
    });
  }

  async getTradeStats(userId: string): Promise<{
    totalTrades: number;
    activeTrades: number;
    completedTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalProfit: number;
    totalLoss: number;
    netProfitLoss: number;
  }> {
    const [
      totalTrades,
      activeTrades,
      completedTrades,
      winningTrades,
      losingTrades,
      trades
    ] = await Promise.all([
      prisma.trade.count({ where: { userId } }),
      prisma.trade.count({ where: { userId, status: "ACTIVE" } }),
      prisma.trade.count({ where: { userId, status: "COMPLETED" } }),
      prisma.trade.count({ where: { userId, result: "WON" } }),
      prisma.trade.count({ where: { userId, result: "LOST" } }),
      prisma.trade.findMany({ where: { userId, status: "COMPLETED" } })
    ]);

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    let totalProfit = 0;
    let totalLoss = 0;

    trades.forEach(trade => {
      if (trade.result === "WON" && trade.payout) {
        totalProfit += Number(trade.payout) - Number(trade.amount);
      } else if (trade.result === "LOST") {
        totalLoss += Number(trade.amount);
      }
    });

    return {
      totalTrades,
      activeTrades,
      completedTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalProfit,
      totalLoss,
      netProfitLoss: totalProfit - totalLoss
    };
  }
}