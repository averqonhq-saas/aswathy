import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { verifyEmailConnection, sendTestEmail } from "@/lib/email";

export async function GET() {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verification = await verifyEmailConnection();
    return NextResponse.json(verification);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to verify connection" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let targetEmail: string | undefined;
    try {
      const body = await request.json();
      targetEmail = body.email;
    } catch {
      // Body is optional
    }

    const result = await sendTestEmail(targetEmail);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
