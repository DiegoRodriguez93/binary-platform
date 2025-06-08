import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "../../../../lib/database";

export async function POST(request: NextRequest) {
    try {
        await initializeDatabase();
        
        return NextResponse.json({
            success: true,
            message: "Database initialized successfully"
        });
    } catch (error) {
        console.error("Database initialization error:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to initialize database",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { AppDataSource } = await import("../../../../lib/database");
        
        const isConnected = AppDataSource.isInitialized;
        
        return NextResponse.json({
            success: true,
            connected: isConnected,
            message: isConnected ? "Database is connected" : "Database is not connected"
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            connected: false,
            message: "Error checking database connection",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}