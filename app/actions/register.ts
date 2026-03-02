"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function register(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "User already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                hashedPassword,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Internal server error" };
    }
}
