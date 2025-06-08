import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "../../../../../lib/database";
import { TradeService } from "../../../../../services/TradeService";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await initializeDatabase();
        
        const body = await request.json();
        const { exitPrice } = body;

        if (!exitPrice) {
            return NextResponse.json({
                success: false,
                message: "exitPrice is required"
            }, { status: 400 });
        }

        const tradeService = new TradeService();
        const trade = await tradeService.completeTrade(params.id, parseFloat(exitPrice));

        if (!trade) {
            return NextResponse.json({
                success: false,
                message: "Trade not found or already completed"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Trade completed successfully",
            trade
        });
    } catch (error) {
        console.error("Error completing trade:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to complete trade",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}