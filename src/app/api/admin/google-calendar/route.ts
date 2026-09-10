import { NextResponse } from "next/server";
import { getGoogleCalendarAuthUrl } from "@/lib/google-calendar";
import fs from "fs";
import path from "path";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

  const isConfigured = Boolean(clientId && clientSecret);
  const isConnected = Boolean(refreshToken && refreshToken.trim() !== "");

  const authUrl = isConfigured ? getGoogleCalendarAuthUrl() : null;

  return NextResponse.json({
    configured: isConfigured,
    connected: isConnected,
    clientId: clientId ? `${clientId.substring(0, 12)}...` : null,
    redirectUri,
    authUrl,
    calendarAccount: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER || "roottherapyonline@gmail.com",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken || typeof refreshToken !== "string") {
      return NextResponse.json(
        { error: "A valid refresh token string is required." },
        { status: 400 }
      );
    }

    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf-8");
      if (envContent.includes("GOOGLE_REFRESH_TOKEN=")) {
        envContent = envContent.replace(
          /GOOGLE_REFRESH_TOKEN=.*/,
          `GOOGLE_REFRESH_TOKEN="${refreshToken.trim()}"`
        );
      } else {
        envContent += `\nGOOGLE_REFRESH_TOKEN="${refreshToken.trim()}"\n`;
      }
      fs.writeFileSync(envPath, envContent, "utf-8");
    }

    process.env.GOOGLE_REFRESH_TOKEN = refreshToken.trim();

    return NextResponse.json({
      success: true,
      message: "Google Calendar refresh token updated successfully.",
      connected: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update refresh token.", details: error?.message },
      { status: 500 }
    );
  }
}
