import { NextResponse } from "next/server";
import { getGoogleCalendarAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  const url = getGoogleCalendarAuthUrl();

  if (!url) {
    return NextResponse.json(
      { error: "Google OAuth is not configured" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(url);
}
