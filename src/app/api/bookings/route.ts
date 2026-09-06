import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, Booking } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      serviceName,
      serviceId,
      appointmentDate,
      appointmentTime,
      format,
      clientMessage,
      notes,
      provider = "internal",
      zohoBookingId,
    } = body;

    if (!clientName || !clientEmail || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    // Prevent duplicate booking entry if already synced via webhook or previous call
    const existing = db.bookings.find(
      (b) =>
        (zohoBookingId && (b.id === `ZOHO-${zohoBookingId}` || b.id === zohoBookingId)) ||
        (b.clientEmail.toLowerCase() === clientEmail.toLowerCase() &&
          b.appointmentDate === appointmentDate &&
          b.appointmentTime === appointmentTime &&
          !b.deletedAt)
    );

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Booking already registered in practice database.",
        booking: existing,
      });
    }

    // Match service
    const matchedService = db.services.find(
      (s) =>
        s.id === serviceId ||
        (serviceName && s.name.toLowerCase().includes(serviceName.toLowerCase()))
    );

    const bookingId = zohoBookingId
      ? `ZOHO-${zohoBookingId.toString().replace(/[^a-zA-Z0-9]/g, "")}`
      : `ASW-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: Booking = {
      id: bookingId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone ? clientPhone.trim() : "+91 (Not Provided)",
      serviceId: matchedService ? matchedService.id : "serv_1",
      serviceName: matchedService ? matchedService.name : (serviceName || "Individual Consultation"),
      appointmentDate,
      appointmentTime,
      durationMinutes: matchedService ? matchedService.durationMinutes : 50,
      format: "online",
      bookingStatus: "pending",
      paymentStatus: provider === "zoho" ? "paid" : "pending",
      price: matchedService ? matchedService.price : 1800,
      meetingLink: "Google Meet link will be generated prior to appointment",
      clientMessage: clientMessage || notes || "",
      history: [
        {
          timestamp: now,
          action: provider === "zoho"
            ? "Booking registered via Zoho Bookings redirect"
            : "Booking request submitted directly via website",
        },
      ],
      provider: provider === "zoho" ? "zoho" : "internal",
      createdAt: now,
      updatedAt: now,
    };

    db.bookings.unshift(newBooking);

    // Create Notification for Admin
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "booking_new",
      title: provider === "zoho" ? "New Zoho Booking Synced" : "New Booking Request",
      message: `${newBooking.clientName} scheduled "${newBooking.serviceName}" for ${newBooking.appointmentDate} at ${newBooking.appointmentTime}.`,
      link: "/admin/bookings",
      isRead: false,
      createdAt: now,
    });

    // Save to Supabase
    await saveDatabase(db);

    return NextResponse.json(
      {
        success: true,
        message: "Booking recorded successfully in practice database.",
        booking: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Public Booking API Error]:", error);
    return NextResponse.json(
      { error: "Failed to record booking.", details: error?.message },
      { status: 500 }
    );
  }
}
