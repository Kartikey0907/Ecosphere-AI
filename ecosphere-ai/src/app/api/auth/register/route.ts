import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { name, email, password } = result.data;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        level: 1,
        xp: 0,
        streak: 0,
      },
    });
    
    // Generate initial sustainability score entry for today
    const todayStr = new Date().toISOString().split("T")[0];
    await prisma.sustainabilityScore.create({
      data: {
        userId: user.id,
        date: todayStr,
        carbonScore: 50,
        waterScore: 50,
        energyScore: 50,
        transportScore: 50,
        recyclingScore: 50,
        wasteScore: 50,
        overallScore: 50,
      },
    });
    
    // Add a welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to EcoSphere AI! 🌍",
        message: "Start tracking your daily activities to reduce your footprint and earn rewards.",
        type: "SYSTEM",
      },
    });
    
    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
