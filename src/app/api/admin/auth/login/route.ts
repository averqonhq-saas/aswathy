import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { verifyPassword, setAdminSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter both email and password." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const admin = db.admins.find(
      (a) => a.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionDurationMs = rememberMe
      ? 1000 * 60 * 60 * 24 * 30 // 30 days
      : 1000 * 60 * 60 * 24; // 1 day

    const expiresAt = Date.now() + sessionDurationMs;

    await setAdminSessionCookie(
      {
        adminId: admin.id,
        email: admin.email,
        name: admin.name,
        expiresAt,
      },
      Boolean(rememberMe)
    );

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        profileImage: admin.profileImage,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
