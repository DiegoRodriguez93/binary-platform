import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./src/entities/User";
import { Trade } from "./src/entities/Trade";
import { TradingSession } from "./src/entities/TradingSession";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    synchronize: false, // Usar migraciones en lugar de sincronización automática
    logging: process.env.NODE_ENV === "development",
    entities: [User, Trade, TradingSession],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
});