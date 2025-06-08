import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "../../../lib/database";
import { UserService } from "../../../services/UserService";

export async function POST(request: NextRequest) {
    try {
        await initializeDatabase();
        
        const body = await request.json();
        const { email, password, firstName, lastName, balance } = body;

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Email and password are required"
            }, { status: 400 });
        }

        const userService = new UserService();
        
        // Verificar si el usuario ya existe
        const existingUser = await userService.findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "User with this email already exists"
            }, { status: 409 });
        }

        const user = await userService.createUser({
            email,
            password, // En producción, asegúrate de hashear la contraseña
            firstName,
            lastName,
            balance: balance || 1000 // Balance inicial por defecto
        });

        // No devolver la contraseña en la respuesta
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            message: "User created successfully",
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Error creating user:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to create user",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await initializeDatabase();
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const userService = new UserService();
        const result = await userService.getAllUsers(page, limit);

        // Remover contraseñas de la respuesta
        const usersWithoutPasswords = result.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        return NextResponse.json({
            success: true,
            data: {
                ...result,
                users: usersWithoutPasswords
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to fetch users",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}