import { NextResponse } from "next/server";
import { bookingService } from "@/lib/booking-adapter";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, saveDatabase } from "@/lib/db";
import { getPgPool } from "@/lib/supabase-db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await bookingService.getBooking(id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, status, internalNotes, date, time, note } = body;

    let updated = null;

    if (action === "update_status" && status) {
      updated = await bookingService.updateBookingStatus(id, status, note);
    } else if (action === "update_notes" && internalNotes !== undefined) {
      updated = await bookingService.updateBookingNotes(id, internalNotes);
    } else if (action === "reschedule" && date && time) {
      updated = await bookingService.rescheduleBooking(id, date, time, note);
    } else if (status) {
      updated = await bookingService.updateBookingStatus(id, status, note);
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Booking not found or update failed." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDatabase();
    
    let found = false;

    // 1. Remove from JSONB collections / db.bookings
    const bookingIndex = db.bookings.findIndex((b) => b.id === id);
    if (bookingIndex !== -1) {
      db.bookings.splice(bookingIndex, 1);
      await saveDatabase(db);
      found = true;
    }

    // 2. Remove from PostgreSQL relational table
    try {
      const pool = getPgPool();
      const res = await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
      if (res.rowCount && res.rowCount > 0) {
        found = true;
      }
    } catch (sqlErr) {
      console.warn("SQL table booking delete notice:", sqlErr);
    }

    if (!found) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Booking removed successfully." });
  } catch (error) {
    console.error("Delete booking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
