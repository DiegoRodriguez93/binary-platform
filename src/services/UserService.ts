import { AppDataSource } from "../lib/database";
import { User } from "../entities/User";
import { Repository } from "typeorm";

export class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    async createUser(userData: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        balance?: number;
    }): Promise<User> {
        const user = this.userRepository.create(userData);
        return await this.userRepository.save(user);
    }

    async findUserById(id: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { id },
            relations: ["trades", "tradingSessions"]
        });
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email }
        });
    }

    async updateUserBalance(userId: string, newBalance: number): Promise<User | null> {
        await this.userRepository.update(userId, { balance: newBalance });
        return await this.findUserById(userId);
    }

    async updateUserStats(userId: string, stats: {
        totalProfit?: number;
        totalLoss?: number;
        totalTrades?: number;
        winningTrades?: number;
        losingTrades?: number;
    }): Promise<User | null> {
        await this.userRepository.update(userId, stats);
        return await this.findUserById(userId);
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

        return {
            totalTrades: user.totalTrades,
            winningTrades: user.winningTrades,
            losingTrades: user.losingTrades,
            winRate: user.winRate,
            totalProfit: user.totalProfit,
            totalLoss: user.totalLoss,
            netProfitLoss: user.netProfitLoss,
            balance: user.balance
        };
    }

    async getAllUsers(page: number = 1, limit: number = 10): Promise<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const [users, total] = await this.userRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" }
        });

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}