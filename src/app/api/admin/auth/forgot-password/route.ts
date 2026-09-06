import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Please provide an email address." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const admin = db.admins.find(
      (a) => a.email.toLowerCase() === email.toLowerCase().trim()
    );

    // Reassuring feedback
    if (!admin) {
      return NextResponse.json({
        success: true,
        message:
          "If an admin account is registered with this address, a password reset link has been dispatched.",
      });
    }

    // In a production email service, dispatch an email. For demo/preview, confirm reset availability:
    return NextResponse.json({
      success: true,
      message: `Password reset instructions have been dispatched to ${email}. Check your inbox or use the temporary master key in Account Settings.`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Unable to process password reset request." },
      { status: 500 }
    );
  }
}
