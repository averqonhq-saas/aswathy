import { NextResponse } from "next/server";
import { getGoogleCalendarAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  const authUrl = getGoogleCalendarAuthUrl();

  if (!authUrl) {
    return NextResponse.json(
      {
        success: false,
        error: "Google OAuth is not configured",
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(authUrl);
}
