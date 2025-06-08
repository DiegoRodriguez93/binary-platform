import { AppDataSource } from "../lib/database";
import { Trade, TradeDirection, TradeStatus, TradeResult } from "../entities/Trade";
import { User } from "../entities/User";
import { Repository } from "typeorm";

export class TradeService {
    private tradeRepository: Repository<Trade>;
    private userRepository: Repository<User>;

    constructor() {
        this.tradeRepository = AppDataSource.getRepository(Trade);
        this.userRepository = AppDataSource.getRepository(User);
    }

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

        const trade = this.tradeRepository.create({
            ...tradeData,
            expiryTime,
            status: "active",
            result: "pending"
        });

        const savedTrade = await this.tradeRepository.save(trade);

        // Actualizar estadísticas del usuario
        await this.userRepository.increment(
            { id: tradeData.userId },
            "totalTrades",
            1
        );

        return savedTrade;
    }

    async completeTrade(tradeId: string, exitPrice: number): Promise<Trade | null> {
        const trade = await this.tradeRepository.findOne({
            where: { id: tradeId },
            relations: ["user"]
        });

        if (!trade || trade.status !== "active") {
            return null;
        }

        const isWinning = trade.direction === "higher" 
            ? exitPrice > trade.entryPrice 
            : exitPrice < trade.entryPrice;

        const result: TradeResult = isWinning ? "won" : "lost";
        const payout = isWinning ? trade.amount * (1 + trade.profitPercentage / 100) : 0;

        // Actualizar el trade
        await this.tradeRepository.update(tradeId, {
            exitPrice,
            status: "completed",
            result,
            payout,
            completedAt: new Date()
        });

        // Actualizar estadísticas del usuario
        const user = trade.user;
        if (isWinning) {
            await this.userRepository.update(user.id, {
                winningTrades: user.winningTrades + 1,
                totalProfit: user.totalProfit + (payout - trade.amount),
                balance: user.balance + payout
            });
        } else {
            await this.userRepository.update(user.id, {
                losingTrades: user.losingTrades + 1,
                totalLoss: user.totalLoss + trade.amount
            });
        }

        return await this.tradeRepository.findOne({
            where: { id: tradeId },
            relations: ["user"]
        });
    }

    async getActiveTrades(userId: string): Promise<Trade[]> {
        return await this.tradeRepository.find({
            where: { 
                userId, 
                status: "active" 
            },
            order: { createdAt: "DESC" }
        });
    }

    async getTradeHistory(userId: string, page: number = 1, limit: number = 20): Promise<{
        trades: Trade[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const [trades, total] = await this.tradeRepository.findAndCount({
            where: { userId },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" }
        });

        return {
            trades,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getExpiredTrades(): Promise<Trade[]> {
        return await this.tradeRepository.find({
            where: {
                status: "active",
                expiryTime: new Date() // Trades que ya expiraron
            }
        });
    }

    async cancelTrade(tradeId: string): Promise<Trade | null> {
        const trade = await this.tradeRepository.findOne({
            where: { id: tradeId }
        });

        if (!trade || trade.status !== "active") {
            return null;
        }

        await this.tradeRepository.update(tradeId, {
            status: "cancelled",
            completedAt: new Date()
        });

        return await this.tradeRepository.findOne({
            where: { id: tradeId }
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
        const totalTrades = await this.tradeRepository.count({
            where: { userId }
        });

        const activeTrades = await this.tradeRepository.count({
            where: { userId, status: "active" }
        });

        const completedTrades = await this.tradeRepository.count({
            where: { userId, status: "completed" }
        });

        const winningTrades = await this.tradeRepository.count({
            where: { userId, result: "won" }
        });

        const losingTrades = await this.tradeRepository.count({
            where: { userId, result: "lost" }
        });

        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

        // Calcular profit/loss total
        const trades = await this.tradeRepository.find({
            where: { userId, status: "completed" }
        });

        let totalProfit = 0;
        let totalLoss = 0;

        trades.forEach(trade => {
            if (trade.result === "won" && trade.payout) {
                totalProfit += trade.payout - trade.amount;
            } else if (trade.result === "lost") {
                totalLoss += trade.amount;
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