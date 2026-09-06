import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, Booking } from "@/lib/db";

/**
 * Normalizes any date string into YYYY-MM-DD
 */
function parseDate(rawDate?: string): string {
  if (!rawDate) return new Date().toISOString().split("T")[0];
  if (rawDate.includes("T")) return rawDate.split("T")[0];
  if (rawDate.includes(" ")) return rawDate.split(" ")[0];
  return rawDate;
}

/**
 * Normalizes any time string into a clean HH:MM or HH:MM AM/PM
 */
function parseTime(rawTime?: string, rawDate?: string): string {
  if (rawTime) {
    if (rawTime.includes("T")) {
      return rawTime.split("T")[1].substring(0, 5);
    }
    if (rawTime.includes(" ") && rawTime.length > 8) {
      return rawTime.split(" ")[1].substring(0, 5);
    }
    return rawTime;
  }
  if (rawDate && (rawDate.includes("T") || rawDate.includes(" "))) {
    const sep = rawDate.includes("T") ? "T" : " ";
    const t = rawDate.split(sep)[1];
    if (t) return t.substring(0, 5);
  }
  return "10:00 AM";
}

/**
 * POST /api/integrations/zoho/bookings
 * Production integration endpoint for Zoho Bookings Workflows & Custom Functions (Deluge).
 */
export async function POST(request: Request) {
  try {
    let payload: Record<string, any> = {};

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = value.toString();
      });
    } else {
      const text = await request.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
    }

    console.log("[Zoho Integration API] Received event:", JSON.stringify(payload));

    // Support nested bookingInfo or data object from Zoho Deluge
    const data = payload.bookingInfo || payload.data || payload.booking || payload.appointment || payload;

    // 1. Extract Zoho Booking ID
    const rawBookingId =
      data.booking_id ||
      data.bookingId ||
      data.id ||
      data.appointment_id ||
      `zoho_${Date.now()}`;
    const cleanId = rawBookingId.toString().replace(/[^a-zA-Z0-9_-]/g, "");
    const bookingInternalId = `ZOHO-${cleanId}`;

    // 2. Extract Event / Action
    const rawAction = (
      data.action ||
      data.event ||
      data.status ||
      payload.action ||
      payload.event ||
      "booked"
    ).toLowerCase();

    const isCancel = rawAction.includes("cancel");
    const isReschedule = rawAction.includes("resched");
    const isComplete = rawAction.includes("complete");

    // 3. Extract Client Details
    const customerObj = data.customer || {};
    const clientName =
      data.customer_name ||
      data.client_name ||
      customerObj.name ||
      data.name ||
      "Zoho Client";

    const clientEmail = (
      data.customer_email ||
      data.client_email ||
      customerObj.email ||
      data.email ||
      "client@example.com"
    ).toLowerCase().trim();

    const clientPhone =
      data.customer_phone ||
      data.client_phone ||
      customerObj.phone_number ||
      data.phone ||
      "+91 (Not Provided)";

    // 4. Extract Service Details
    const serviceObj = data.service || {};
    const serviceName =
      data.service_name ||
      serviceObj.name ||
      data.service ||
      "Individual Online Consultation";

    // 5. Extract Schedule (Date & Time)
    const rawStart =
      data.start_time ||
      data.startTime ||
      data.start_date ||
      data.appointment_date ||
      data.date;

    const rawTime =
      data.booking_time ||
      data.appointment_time ||
      data.time ||
      rawStart;

    const appointmentDate = parseDate(rawStart);
    const appointmentTime = parseTime(rawTime, rawStart);

    const notes =
      data.notes ||
      data.notes_by_customer ||
      data.summary ||
      data.comments ||
      "";

    const meetingLink =
      data.join_link ||
      data.meeting_info ||
      data.meeting_url ||
      "Google Meet Telehealth (Link sent via Zoho email)";

    const durationMinutes = parseInt(
      data.duration || serviceObj.duration || "50",
      10
    ) || 50;

    const db = await getDatabase();
    const now = new Date().toISOString();

    // 6. Duplicate Protection: Check if booking already exists
    const existingIndex = db.bookings.findIndex(
      (b) =>
        b.id === bookingInternalId ||
        (b.clientEmail === clientEmail &&
          b.appointmentDate === appointmentDate &&
          b.appointmentTime === appointmentTime &&
          !b.deletedAt)
    );

    let savedBooking: Booking;
    let eventType: "created" | "rescheduled" | "cancelled" | "updated" = "created";

    if (existingIndex >= 0) {
      // Existing booking -> UPDATE
      savedBooking = db.bookings[existingIndex];

      if (isCancel) {
        savedBooking.bookingStatus = "cancelled";
        savedBooking.history.unshift({
          timestamp: now,
          action: `Appointment marked CANCELLED via Zoho event (${rawAction})`,
        });
        eventType = "cancelled";

        db.notifications.unshift({
          id: `notif_${Date.now()}`,
          type: "booking_cancel",
          title: "Zoho Appointment Cancelled",
          message: `${clientName} cancelled their session for ${savedBooking.appointmentDate}.`,
          link: "/admin/bookings",
          isRead: false,
          createdAt: now,
        });
      } else if (isReschedule) {
        const oldDate = savedBooking.appointmentDate;
        const oldTime = savedBooking.appointmentTime;
        savedBooking.appointmentDate = appointmentDate;
        savedBooking.appointmentTime = appointmentTime;
        savedBooking.bookingStatus = "confirmed";
        savedBooking.history.unshift({
          timestamp: now,
          action: `Rescheduled via Zoho from ${oldDate} ${oldTime} to ${appointmentDate} ${appointmentTime}`,
        });
        eventType = "rescheduled";

        db.notifications.unshift({
          id: `notif_${Date.now()}`,
          type: "booking_rescheduled",
          title: "Zoho Appointment Rescheduled",
          message: `${clientName} rescheduled consultation to ${appointmentDate} at ${appointmentTime}.`,
          link: "/admin/bookings",
          isRead: false,
          createdAt: now,
        });
      } else {
        if (isComplete) savedBooking.bookingStatus = "completed";
        savedBooking.updatedAt = now;
        if (notes) savedBooking.clientMessage = notes;
        savedBooking.history.unshift({
          timestamp: now,
          action: `Zoho booking record refreshed (${rawAction})`,
        });
        eventType = "updated";
      }
      savedBooking.updatedAt = now;
    } else {
      // New booking -> INSERT
      const matchedService = db.services.find(
        (s) =>
          s.name.toLowerCase().includes(serviceName.toLowerCase()) ||
          serviceName.toLowerCase().includes(s.name.toLowerCase())
      );

      let initialStatus: "pending" | "confirmed" | "completed" | "cancelled" = "confirmed";
      if (isCancel) initialStatus = "cancelled";
      if (isComplete) initialStatus = "completed";

      savedBooking = {
        id: bookingInternalId,
        clientName,
        clientEmail,
        clientPhone,
        serviceId: matchedService ? matchedService.id : "serv_1",
        serviceName: matchedService ? matchedService.name : serviceName,
        appointmentDate,
        appointmentTime,
        durationMinutes,
        format: "online",
        bookingStatus: initialStatus,
        paymentStatus: "paid",
        price: matchedService ? matchedService.price : 1800,
        meetingLink,
        clientMessage: notes,
        history: [
          {
            timestamp: now,
            action: `Appointment created via Zoho Bookings integration (Ref: ${cleanId})`,
          },
        ],
        provider: "zoho",
        createdAt: now,
        updatedAt: now,
      };

      db.bookings.unshift(savedBooking);
      eventType = "created";

      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        type: "booking_new",
        title: "New Zoho Booking Synced",
        message: `${clientName} booked "${savedBooking.serviceName}" for ${appointmentDate} at ${appointmentTime} via Zoho.`,
        link: "/admin/bookings",
        isRead: false,
        createdAt: now,
      });
    }

    // 7. Persist to Supabase (Atomic write to both practice_collections and bookings SQL table)
    await saveDatabase(db);

    return NextResponse.json({
      success: true,
      event: eventType,
      message: `Zoho booking ${eventType} successfully in Supabase database.`,
      bookingId: savedBooking.id,
      zohoBookingId: cleanId,
      booking: savedBooking,
    });
  } catch (error: any) {
    console.error("[Zoho Integration API Error]:", error);
    return NextResponse.json(
      { error: "Failed to process Zoho booking event.", details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    endpoint: "/api/integrations/zoho/bookings",
    version: "2.0",
    description: "Production Zoho Bookings integration endpoint for Supabase Admin Dashboard.",
    supportedEvents: ["booked", "rescheduled", "cancelled", "completed"],
  });
}
