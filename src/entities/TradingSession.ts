import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("trading_sessions")
export class TradingSession {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.tradingSessions)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    startingBalance: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    endingBalance?: number;

    @Column({ type: "int", default: 0 })
    totalTrades: number;

    @Column({ type: "int", default: 0 })
    winningTrades: number;

    @Column({ type: "int", default: 0 })
    losingTrades: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalProfit: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalLoss: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    maxDrawdown: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    maxProfit: number;

    @Column({ type: "json", nullable: true })
    tradedSymbols?: string[];

    @Column({ type: "json", nullable: true })
    sessionMetadata?: {
        averageTradeAmount?: number;
        mostTradedSymbol?: string;
        sessionDuration?: number;
        [key: string]: any;
    };

    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @CreateDateColumn()
    startedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: "timestamp", nullable: true })
    endedAt?: Date;

    // Método para calcular el win rate de la sesión
    get winRate(): number {
        if (this.totalTrades === 0) return 0;
        return (this.winningTrades / this.totalTrades) * 100;
    }

    // Método para calcular el profit/loss neto de la sesión
    get netProfitLoss(): number {
        return this.totalProfit - this.totalLoss;
    }

    // Método para calcular el ROI de la sesión
    get roi(): number {
        if (this.startingBalance === 0) return 0;
        return (this.netProfitLoss / this.startingBalance) * 100;
    }
}