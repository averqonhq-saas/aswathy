import { NextResponse } from "next/server";
import { bookingService } from "@/lib/booking-adapter";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, saveDatabase } from "@/lib/db";

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
    const booking = db.bookings.find((b) => b.id === id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // Soft delete
    booking.deletedAt = new Date().toISOString();
    booking.bookingStatus = "cancelled";
    await saveDatabase(db);

    return NextResponse.json({ success: true, message: "Booking removed." });
  } catch (error) {
    console.error("Delete booking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
