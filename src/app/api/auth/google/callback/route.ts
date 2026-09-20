import { NextResponse } from "next/server";
import { getGoogleOAuth2Client } from "@/lib/google-calendar";
import fs from "fs";
import path from "path";

function saveRefreshTokenToEnv(refreshToken: string) {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf-8");
      if (envContent.includes("GOOGLE_REFRESH_TOKEN=")) {
        envContent = envContent.replace(
          /GOOGLE_REFRESH_TOKEN=.*/,
          `GOOGLE_REFRESH_TOKEN="${refreshToken}"`
        );
      } else {
        envContent += `\nGOOGLE_REFRESH_TOKEN="${refreshToken}"\n`;
      }
      fs.writeFileSync(envPath, envContent, "utf-8");
    }
    // Also update runtime environment variable
    process.env.GOOGLE_REFRESH_TOKEN = refreshToken;
  } catch (err) {
    console.error("[Google OAuth] Error saving refresh token to .env.local:", err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new Response(
      `<html>
        <head><title>Google Calendar Authorization Failed</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff1f2;">
          <div style="max-width: 500px; padding: 32px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
            <h2 style="color: #991b1b; margin-top: 0;">Authorization Failed</h2>
            <p style="color: #4b5563;">Google returned an error: <strong>${error}</strong></p>
            <a href="/admin" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #111827; color: white; text-decoration: none; border-radius: 8px;">Return to Admin</a>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" }, status: 400 }
    );
  }

  if (!code) {
    return new Response(
      `<html>
        <head><title>Missing Authorization Code</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f9fafb;">
          <div style="max-width: 500px; padding: 32px; background: white; border-radius: 16px; text-align: center;">
            <h2 style="color: #b45309;">Missing Code</h2>
            <p style="color: #4b5563;">No authorization code was provided in the callback request.</p>
            <a href="/admin" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #111827; color: white; text-decoration: none; border-radius: 8px;">Return to Admin</a>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" }, status: 400 }
    );
  }

  try {
    const oauth2Client = getGoogleOAuth2Client();
    if (!oauth2Client) {
      throw new Error("Google OAuth client could not be initialized.");
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      saveRefreshTokenToEnv(tokens.refresh_token);
    } else {
      console.warn(
        "[Google OAuth] Notice: No refresh token returned. User may have previously authorized without prompt=consent."
      );
    }

    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Google Calendar Connected — Root Therapy</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            max-width: 520px;
            width: 100%;
            background: #ffffff;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 40px -15px rgba(5, 150, 105, 0.15);
            border: 1px solid #d1fae5;
          }
          .icon {
            width: 68px;
            height: 68px;
            background: #dcfce7;
            color: #059669;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 34px;
            margin: 0 auto 24px;
          }
          h1 {
            color: #065f46;
            font-size: 24px;
            margin: 0 0 12px;
            font-weight: 700;
          }
          p {
            color: #374151;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 24px;
          }
          .badge-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 28px;
            text-align: left;
            font-size: 13px;
            color: #475569;
          }
          .badge-box li {
            margin-bottom: 6px;
          }
          .btn {
            display: inline-block;
            background: #059669;
            color: #ffffff;
            font-weight: 600;
            padding: 12px 28px;
            border-radius: 10px;
            text-decoration: none;
            transition: all 0.2s ease;
          }
          .btn:hover {
            background: #047857;
            transform: translateY(-1px);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h1>Google Calendar Connected!</h1>
          <p>Your Google Calendar and Google Meet integration is now active. When clients book appointments:</p>
          <div class="badge-box">
            <ul style="margin: 0; padding-left: 18px;">
              <li>Google Calendar event is automatically added to primary calendar</li>
              <li>Google Meet link is instantly generated</li>
              <li>Client & Admin are added as attendees with calendar invites</li>
              <li>Custom branded confirmation email is delivered via Gmail SMTP</li>
            </ul>
          </div>
          ${tokens.refresh_token ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 24px; text-align: left;">
            <div style="font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase; margin-bottom: 6px;">
              Fresh Refresh Token Generated:
            </div>
            <code style="font-size: 11px; color: #1e293b; word-break: break-all; background: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; display: block; user-select: all;">
              ${tokens.refresh_token}
            </code>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
              Saved locally. Please also copy this into Vercel Settings &gt; Environment Variables as <code>GOOGLE_REFRESH_TOKEN</code>.
            </div>
          </div>` : ""}
          <a href="/admin/bookings" class="btn">Go to Admin Bookings</a>
        </div>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" }, status: 200 }
    );
  } catch (err: any) {
    console.error("[Google OAuth Callback Error]:", err);
    return new Response(
      `<html>
        <head><title>Authorization Exchange Error</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff1f2;">
          <div style="max-width: 500px; padding: 32px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h2 style="color: #991b1b; margin-top: 0;">Exchange Failed</h2>
            <p style="color: #4b5563;">Could not exchange authorization code for access token: ${err?.message || err}</p>
            <a href="/admin" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #111827; color: white; text-decoration: none; border-radius: 8px;">Return to Admin</a>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" }, status: 500 }
    );
  }
}
