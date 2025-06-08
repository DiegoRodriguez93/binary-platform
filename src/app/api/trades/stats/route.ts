import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "../../../../lib/database";
import { TradeService } from "../../../../services/TradeService";

export async function GET(request: NextRequest) {
    try {
        await initializeDatabase();
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "userId is required"
            }, { status: 400 });
        }

        const tradeService = new TradeService();
        const stats = await tradeService.getTradeStats(userId);

        return NextResponse.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("Error fetching trade stats:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to fetch trade stats",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}