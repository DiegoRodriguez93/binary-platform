import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Trade } from "./Trade";
import { TradingSession } from "./TradingSession";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    firstName?: string;

    @Column({ nullable: true })
    lastName?: string;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    balance: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalProfit: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalLoss: number;

    @Column({ type: "int", default: 0 })
    totalTrades: number;

    @Column({ type: "int", default: 0 })
    winningTrades: number;

    @Column({ type: "int", default: 0 })
    losingTrades: number;

    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @Column({ type: "enum", enum: ["user", "admin"], default: "user" })
    role: "user" | "admin";

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Trade, trade => trade.user)
    trades: Trade[];

    @OneToMany(() => TradingSession, session => session.user)
    tradingSessions: TradingSession[];

    // Método para calcular el win rate
    get winRate(): number {
        if (this.totalTrades === 0) return 0;
        return (this.winningTrades / this.totalTrades) * 100;
    }

    // Método para calcular el profit/loss neto
    get netProfitLoss(): number {
        return this.totalProfit - this.totalLoss;
    }
}