import { NextResponse } from "next/server";
import { bookingService } from "@/lib/booking-adapter";
import { getCurrentAdmin } from "@/lib/auth";

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
