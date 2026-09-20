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
      `Google authorization failed: ${error}`,
      { status: 400 }
    );
  }

  if (!code) {
    return new Response(
      "Missing Google authorization code.",
      { status: 400 }
    );
  }

  try {
    const oauth2Client = getGoogleOAuth2Client();
    if (!oauth2Client) {
      throw new Error("Google OAuth client is not configured.");
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new Error(
        "Google did not return a refresh token. Please reconnect Google Calendar."
      );
    }

    // Save to local .env.local and runtime process if in local dev
    saveRefreshTokenToEnv(tokens.refresh_token);

    console.log("[Google OAuth] Refresh token received successfully.");

    /*
     * IMPORTANT:
     * Do NOT display the refresh token in the browser.
     * Copy the token to Vercel: GOOGLE_REFRESH_TOKEN=...
     */
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Google Calendar Connected</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #f7f7f7;
      margin: 0;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,.08);
      max-width: 440px;
    }
    .success {
      font-size: 48px;
      color: #059669;
      margin-bottom: 16px;
    }
    h1 {
      margin-bottom: 10px;
      color: #1e293b;
      font-size: 24px;
    }
    p {
      color: #64748b;
      font-size: 15px;
      line-height: 1.5;
      margin: 8px 0;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 24px;
      background: #059669;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="success">✓</div>
    <h1>Google Calendar Connected</h1>
    <p>Your Google Calendar has been connected successfully.</p>
    <p>You can close this window.</p>
    <a href="/admin/bookings" class="btn">Return to Bookings</a>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error: any) {
    console.error("[Google OAuth Callback]", error);
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Google Calendar Connection Failed</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #fdf2f2;
      margin: 0;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,.08);
      max-width: 440px;
    }
    .error-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h1 {
      margin-bottom: 10px;
      color: #991b1b;
      font-size: 22px;
    }
    p {
      color: #4b5563;
      font-size: 14px;
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background: #111827;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="error-icon">⚠️</div>
    <h1>Google Calendar Connection Failed</h1>
    <p>${error?.message || "Please try connecting again."}</p>
    <a href="/api/auth/google" class="btn">Try Connecting Again</a>
  </div>
</body>
</html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}
