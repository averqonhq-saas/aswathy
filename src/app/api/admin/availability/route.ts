import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, AvailabilityRule } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    return NextResponse.json({
      availability: db.availability,
      settings: db.settings.booking,
    });
  } catch (error) {
    console.error("Availability GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability rules." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rules, bookingSettings } = body;

    const db = await getDatabase();
    const now = new Date().toISOString();

    if (Array.isArray(rules)) {
      db.availability = rules.map((r: AvailabilityRule) => ({
        ...r,
        updatedAt: now,
      }));
    }

    if (bookingSettings) {
      db.settings.booking = {
        ...db.settings.booking,
        ...bookingSettings,
      };
    }

    await saveDatabase(db);
    return NextResponse.json({
      success: true,
      availability: db.availability,
      settings: db.settings.booking,
    });
  } catch (error) {
    console.error("Availability PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update availability." },
      { status: 500 }
    );
  }
}
