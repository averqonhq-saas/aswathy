import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, BlockedSlot } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    const bookings = db.bookings.filter((b) => !b.deletedAt);
    const blockedSlots = db.blockedSlots;
    const availability = db.availability;
    const singleDaySlots = db.bookingFormConfig?.singleDaySlots || [];

    return NextResponse.json({
      bookings,
      blockedSlots,
      availability,
      singleDaySlots,
    });
  } catch (error) {
    console.error("Calendar GET error:", error);
    return NextResponse.json(
      { error: "Failed to load calendar data." },
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

    const body = await request.json();
    const { title, type, date, startTime, endTime, reason } = body;

    if (!title || !type || !date) {
      return NextResponse.json(
        { error: "Title, type, and date are required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const newBlockedSlot: BlockedSlot = {
      id: `blk_${Date.now()}`,
      title,
      type,
      date,
      startTime: type === "slot" ? startTime : undefined,
      endTime: type === "slot" ? endTime : undefined,
      reason,
      createdAt: now,
      updatedAt: now,
    };

    db.blockedSlots.push(newBlockedSlot);
    await saveDatabase(db);

    return NextResponse.json(
      { success: true, blockedSlot: newBlockedSlot },
      { status: 201 }
    );
  } catch (error) {
    console.error("Calendar POST error:", error);
    return NextResponse.json(
      { error: "Failed to block time slot." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Blocked slot ID is required" }, { status: 400 });
    }

    const db = await getDatabase();
    db.blockedSlots = db.blockedSlots.filter((b) => b.id !== id);
    await saveDatabase(db);

    return NextResponse.json({ success: true, message: "Blocked slot removed successfully." });
  } catch (error) {
    console.error("Calendar DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete blocked slot." },
      { status: 500 }
    );
  }
}
