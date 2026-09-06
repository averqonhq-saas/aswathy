import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, Booking } from "@/lib/db";

/**
 * Helper to normalize date to YYYY-MM-DD
 */
function normalizeDate(rawDate?: string): string {
  if (!rawDate) return new Date().toISOString().split("T")[0];
  // If it's like "2026-09-15 10:30:00" or ISO
  if (rawDate.includes("T")) {
    return rawDate.split("T")[0];
  }
  if (rawDate.includes(" ")) {
    return rawDate.split(" ")[0];
  }
  return rawDate;
}

/**
 * Helper to normalize time to "HH:MM AM/PM" or "HH:MM"
 */
function normalizeTime(rawTime?: string, rawDate?: string): string {
  if (rawTime) {
    if (rawTime.includes("T")) {
      const parts = rawTime.split("T")[1];
      return parts.substring(0, 5);
    }
    if (rawTime.includes(" ") && rawTime.length > 8) {
      return rawTime.split(" ")[1].substring(0, 5);
    }
    return rawTime;
  }
  if (rawDate && (rawDate.includes("T") || rawDate.includes(" "))) {
    const separator = rawDate.includes("T") ? "T" : " ";
    const timePart = rawDate.split(separator)[1];
    if (timePart) return timePart.substring(0, 5);
  }
  return "10:00 AM";
}

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
      // Fallback try JSON, then text
      const text = await request.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
    }

    console.log("[Zoho Webhook] Received payload:", JSON.stringify(payload));

    // Handle nested Zoho webhook payloads if wrapped in `data` or `booking`
    const data = payload.data || payload.booking || payload.appointment || payload;

    // Extract fields with multiple standard Zoho variations
    const bookingId =
      data.booking_id ||
      data.bookingId ||
      data.id ||
      data.appointment_id ||
      data.appointmentId ||
      `zoho_${Date.now()}`;

    const clientName =
      data.customer_name ||
      data.customerName ||
      data.client_name ||
      data.clientName ||
      data.name ||
      data.user_name ||
      "Zoho Client";

    const clientEmail =
      data.customer_email ||
      data.customerEmail ||
      data.client_email ||
      data.clientEmail ||
      data.email ||
      "client@example.com";

    const clientPhone =
      data.customer_phone ||
      data.customerPhone ||
      data.client_phone ||
      data.clientPhone ||
      data.phone_number ||
      data.phone ||
      data.mobile ||
      "+91 (Not Provided)";

    const serviceName =
      data.service_name ||
      data.serviceName ||
      data.service ||
      data.service_id ||
      "Online Therapy Consultation";

    const rawDate =
      data.start_time ||
      data.startTime ||
      data.start_date ||
      data.date ||
      data.booking_date ||
      data.appointment_date;

    const rawTime =
      data.booking_time ||
      data.time ||
      data.start_time ||
      data.startTime;

    const appointmentDate = normalizeDate(rawDate);
    const appointmentTime = normalizeTime(rawTime, rawDate);

    const durationMinutes = parseInt(
      data.duration || data.duration_minutes || data.durationMinutes || "50",
      10
    ) || 50;

    const notes =
      data.notes ||
      data.notes_by_customer ||
      data.comments ||
      data.client_message ||
      data.additional_info ||
      "";

    const rawStatus = (
      data.status ||
      data.booking_status ||
      data.action ||
      "confirmed"
    ).toLowerCase();

    let bookingStatus: "pending" | "confirmed" | "completed" | "cancelled" = "confirmed";
    if (rawStatus.includes("cancel")) {
      bookingStatus = "cancelled";
    } else if (rawStatus.includes("complete")) {
      bookingStatus = "completed";
    } else if (rawStatus.includes("pending")) {
      bookingStatus = "pending";
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    // Check if this booking already exists in our database
    const existingIndex = db.bookings.findIndex(
      (b) =>
        b.id === `ZOHO-${bookingId}` ||
        b.id === bookingId ||
        (b.clientEmail.toLowerCase() === clientEmail.toLowerCase() &&
          b.appointmentDate === appointmentDate &&
          b.appointmentTime === appointmentTime)
    );

    let savedBooking: Booking;

    if (existingIndex >= 0) {
      // Update existing booking
      savedBooking = db.bookings[existingIndex];
      savedBooking.bookingStatus = bookingStatus;
      savedBooking.updatedAt = now;
      if (notes && !savedBooking.clientMessage) {
        savedBooking.clientMessage = notes;
      }
      savedBooking.history.unshift({
        timestamp: now,
        action: `Zoho Booking update received: status changed to ${bookingStatus}.`,
      });
    } else {
      // Find matching service from catalog if possible
      const matchedService = db.services.find(
        (s) =>
          s.name.toLowerCase().includes(serviceName.toLowerCase()) ||
          serviceName.toLowerCase().includes(s.name.toLowerCase())
      );

      // Create new booking record copied from Zoho
      savedBooking = {
        id: `ZOHO-${bookingId.toString().replace(/[^a-zA-Z0-9]/g, "")}`,
        clientName,
        clientEmail,
        clientPhone,
        serviceId: matchedService ? matchedService.id : "serv_1",
        serviceName: matchedService ? matchedService.name : serviceName,
        appointmentDate,
        appointmentTime,
        durationMinutes,
        format: "online",
        bookingStatus,
        paymentStatus: "paid",
        price: matchedService ? matchedService.price : 1800,
        meetingLink: data.meeting_url || data.google_meet_link || "Google Meet link sent via Zoho email",
        clientMessage: notes,
        history: [
          {
            timestamp: now,
            action: `Booking automatically copied from Zoho Bookings (Ref: ${bookingId})`,
          },
        ],
        provider: "zoho",
        createdAt: now,
        updatedAt: now,
      };

      db.bookings.unshift(savedBooking);

      // Create high-priority Admin Notification
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

    // Persist immediately to Supabase
    await saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Zoho booking successfully copied to admin bookings database.",
      bookingId: savedBooking.id,
      booking: savedBooking,
    });
  } catch (err: any) {
    console.error("[Zoho Webhook Error]:", err);
    return NextResponse.json(
      { error: "Failed to process Zoho webhook.", details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/zoho",
    description: "Zoho Bookings Webhook Endpoint for copying appointments to admin database.",
  });
}
