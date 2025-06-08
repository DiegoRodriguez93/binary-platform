import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "../../../lib/database";
import { TradeService } from "../../../services/TradeService";

export async function POST(request: NextRequest) {
    try {
        await initializeDatabase();
        
        const body = await request.json();
        const {
            userId,
            symbol,
            direction,
            entryPrice,
            amount,
            profitPercentage,
            expirySeconds,
            metadata
        } = body;

        // Validaciones básicas
        if (!userId || !symbol || !direction || !entryPrice || !amount || !profitPercentage || !expirySeconds) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields"
            }, { status: 400 });
        }

        if (!["higher", "lower"].includes(direction)) {
            return NextResponse.json({
                success: false,
                message: "Direction must be 'higher' or 'lower'"
            }, { status: 400 });
        }

        const tradeService = new TradeService();
        const trade = await tradeService.createTrade({
            userId,
            symbol,
            direction,
            entryPrice: parseFloat(entryPrice),
            amount: parseFloat(amount),
            profitPercentage: parseFloat(profitPercentage),
            expirySeconds: parseInt(expirySeconds),
            metadata
        });

        return NextResponse.json({
            success: true,
            message: "Trade created successfully",
            trade
        });
    } catch (error) {
        console.error("Error creating trade:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to create trade",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await initializeDatabase();
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "userId is required"
            }, { status: 400 });
        }

        const tradeService = new TradeService();
        const result = await tradeService.getTradeHistory(userId, page, limit);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Error fetching trades:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to fetch trades",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}