import { NextResponse } from "next/server";
import { bookingService } from "@/lib/booking-adapter";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, saveDatabase } from "@/lib/db";
import { getPgPool } from "@/lib/supabase-db";

export async function GET(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const serviceId = searchParams.get("serviceId") || undefined;
    const date = searchParams.get("date") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await bookingService.listBookings({
      status,
      serviceId,
      date,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("List bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
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
    const {
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      appointmentDate,
      appointmentTime,
      format,
      clientMessage,
    } = body;

    if (
      !clientName ||
      !clientEmail ||
      !clientPhone ||
      !serviceId ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    const newBooking = await bookingService.createBooking({
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      appointmentDate,
      appointmentTime,
      format: format || "online",
      clientMessage,
    });

    return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking." },
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

    const db = await getDatabase();
    db.bookings = [];
    db.notifications = db.notifications.filter(
      (n) => !n.link?.includes("/admin/bookings") && !n.type?.startsWith("booking")
    );
    await saveDatabase(db);

    try {
      const pool = getPgPool();
      await pool.query("DELETE FROM bookings");
    } catch (sqlErr) {
      console.warn("SQL table clear notice:", sqlErr);
    }

    return NextResponse.json({ success: true, message: "All bookings cleared successfully." });
  } catch (error) {
    console.error("Clear all bookings error:", error);
    return NextResponse.json(
      { error: "Failed to clear bookings." },
      { status: 500 }
    );
  }
}

