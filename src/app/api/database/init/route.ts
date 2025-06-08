import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
    try {
        // Test database connection
        await prisma.$connect();
        
        return NextResponse.json({
            success: true,
            message: "Database connected successfully"
        });
    } catch (error) {
        console.error("Database connection error:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to connect to database",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        
        return NextResponse.json({
            success: true,
            connected: true,
            message: "Database is connected"
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