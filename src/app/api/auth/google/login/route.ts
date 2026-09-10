import { NextResponse } from "next/server";
import { getGoogleCalendarAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  const authUrl = getGoogleCalendarAuthUrl();

  if (!authUrl) {
    return NextResponse.json(
      {
        error:
          "Google OAuth credentials missing. Please make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in .env.local.",
      },
      { status: 400 }
    );
  }

  return NextResponse.redirect(authUrl);
}
