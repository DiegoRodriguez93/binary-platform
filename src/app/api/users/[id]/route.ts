import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "../../../../lib/database";
import { UserService } from "../../../../services/UserService";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await initializeDatabase();
        
        const userService = new UserService();
        const user = await userService.findUserById(params.id);

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // No devolver la contraseña
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to fetch user",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await initializeDatabase();
        
        const body = await request.json();
        const userService = new UserService();

        if (body.balance !== undefined) {
            const user = await userService.updateUserBalance(params.id, body.balance);
            if (!user) {
                return NextResponse.json({
                    success: false,
                    message: "User not found"
                }, { status: 404 });
            }

            const { password, ...userWithoutPassword } = user;
            return NextResponse.json({
                success: true,
                message: "User balance updated successfully",
                user: userWithoutPassword
            });
        }

        if (body.stats) {
            const user = await userService.updateUserStats(params.id, body.stats);
            if (!user) {
                return NextResponse.json({
                    success: false,
                    message: "User not found"
                }, { status: 404 });
            }

            const { password, ...userWithoutPassword } = user;
            return NextResponse.json({
                success: true,
                message: "User stats updated successfully",
                user: userWithoutPassword
            });
        }

        return NextResponse.json({
            success: false,
            message: "No valid update data provided"
        }, { status: 400 });
    } catch (error) {
        console.error("Error updating user:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to update user",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}