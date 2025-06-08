import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Trade } from "../entities/Trade";
import { TradingSession } from "../entities/TradingSession";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    synchronize: process.env.NODE_ENV === "development", // Solo en desarrollo
    logging: process.env.NODE_ENV === "development",
    entities: [User, Trade, TradingSession],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
});

// Función para inicializar la conexión
export const initializeDatabase = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("✅ Database connection established successfully");
        }
        return AppDataSource;
    } catch (error) {
        console.error("❌ Error during database initialization:", error);
        throw error;
    }
};

// Función para cerrar la conexión
export const closeDatabase = async () => {
    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("✅ Database connection closed successfully");
        }
    } catch (error) {
        console.error("❌ Error closing database connection:", error);
        throw error;
    }
};