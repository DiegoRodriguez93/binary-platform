import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export type TradeDirection = "higher" | "lower";
export type TradeStatus = "active" | "completed" | "cancelled";
export type TradeResult = "won" | "lost" | "pending";

@Entity("trades")
export class Trade {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.trades)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column({ length: 20 })
    symbol: string;

    @Column({ type: "enum", enum: ["higher", "lower"] })
    direction: TradeDirection;

    @Column({ type: "decimal", precision: 15, scale: 8 })
    entryPrice: number;

    @Column({ type: "decimal", precision: 15, scale: 8, nullable: true })
    exitPrice?: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number;

    @Column({ type: "decimal", precision: 5, scale: 2 })
    profitPercentage: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    payout?: number;

    @Column({ type: "int" })
    expirySeconds: number;

    @Column({ type: "timestamp" })
    expiryTime: Date;

    @Column({ type: "enum", enum: ["active", "completed", "cancelled"], default: "active" })
    status: TradeStatus;

    @Column({ type: "enum", enum: ["won", "lost", "pending"], default: "pending" })
    result: TradeResult;

    @Column({ type: "json", nullable: true })
    metadata?: {
        marketTrend?: string;
        riskLevel?: string;
        timeFrame?: string;
        [key: string]: any;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: "timestamp", nullable: true })
    completedAt?: Date;

    // Método para calcular si el trade fue ganador
    isWinning(currentPrice: number): boolean {
        if (this.status !== "completed" || !this.exitPrice) return false;
        
        const priceDiff = this.exitPrice - this.entryPrice;
        return this.direction === "higher" ? priceDiff > 0 : priceDiff < 0;
    }

    // Método para calcular el profit/loss
    calculateProfitLoss(): number {
        if (this.status !== "completed" || this.result === "pending") return 0;
        
        if (this.result === "won") {
            return (this.payout || 0) - this.amount;
        } else {
            return -this.amount;
        }
    }
}