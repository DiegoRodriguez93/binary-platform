import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName } = body;

        // Validaciones
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Email and password are required"
            }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({
                success: false,
                message: "Password must be at least 6 characters long"
            }, { status: 400 });
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "User with this email already exists"
            }, { status: 409 });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear nuevo usuario con bonus de bienvenida
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName,
                balance: 5000, // Bonus de bienvenida de $5000 USD
                hasReceivedWelcomeBonus: true,
                authProvider: "EMAIL",
                lastLoginAt: new Date()
            }
        });

        // No devolver la contraseña en la respuesta
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            message: "Account created successfully! You've received a $5000 welcome bonus!",
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Error creating user:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to create account",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}