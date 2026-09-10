import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, Booking } from "@/lib/db";
import { sendBookingConfirmationToClient, sendBookingAlertToAdmin } from "@/lib/email";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { getPgPool } from "@/lib/supabase-db";

export async function POST(request: Request) {
  try {
    let body: Record<string, any> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    } else {
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = { raw: text };
      }
    }

    const clientName = (
      body.clientName ||
      body.name ||
      "Valued Client"
    ).trim();

    const clientEmail = (
      body.clientEmail ||
      body.email ||
      ""
    )
      .trim()
      .toLowerCase();

    const clientPhone = (
      body.clientPhone ||
      body.phone ||
      "+91 (Not Provided)"
    ).trim();

    const serviceName =
      body.serviceName || body.service || "Individual Online Consultation";
    const serviceId = body.serviceId;

    const rawDate =
      body.appointmentDate ||
      body.date ||
      new Date().toISOString().split("T")[0];

    const rawTime = body.appointmentTime || body.time || "10:00 AM";

    const appointmentDate = rawDate.includes("T")
      ? rawDate.split("T")[0]
      : rawDate.split(" ")[0];

    const appointmentTime = rawTime.includes("T")
      ? rawTime.split("T")[1].substring(0, 5)
      : rawTime;

    const format: "online" | "in-person" =
      (body.format === "in-person" || body.format === "studio" || body.format === "offline")
        ? "in-person"
        : "online";

    const clientMessage = body.clientMessage || body.notes || "";

    if (!clientName || !clientEmail) {
      return NextResponse.json(
        {
          error:
            "Missing required client details (name and email are required).",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    // Prevent duplicate booking entry
    const existing = db.bookings.find(
      (b) =>
        b.clientEmail.toLowerCase() === clientEmail.toLowerCase() &&
        b.appointmentDate === appointmentDate &&
        b.appointmentTime === appointmentTime &&
        !b.deletedAt
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
        (serviceName &&
          s.name.toLowerCase().includes(serviceName.toLowerCase()))
    );

    const bookingId = `ASW-${Math.floor(100000 + Math.random() * 900000)}`;
    const durationMinutes = matchedService ? matchedService.durationMinutes : (body.durationMinutes || 50);
    const finalServiceName = matchedService ? matchedService.name : (serviceName || "Individual Consultation");
    const price = matchedService ? matchedService.price : (body.price || 1800);
    const isPaid = (body.paymentStatus === "paid" || body.razorpayPaymentId || body.razorpay_payment_id);

    // Automatically create Google Calendar Event with Google Meet conference
    let meetingLink = format === "in-person"
      ? "In-Person Consultation at Clinic"
      : "Google Meet link will be generated prior to appointment";
    let calendarEventId: string | undefined = undefined;

    try {
      const calendarResult = await createCalendarEventWithMeet({
        bookingId,
        clientName,
        clientEmail,
        clientPhone,
        serviceName: finalServiceName,
        appointmentDate,
        appointmentTime,
        durationMinutes,
        format,
        clientMessage,
      });

      if (calendarResult.success) {
        calendarEventId = calendarResult.eventId;
        if (calendarResult.meetingLink) {
          meetingLink = calendarResult.meetingLink;
        }
      } else if (calendarResult.warning) {
        console.warn("[Google Calendar Notice]:", calendarResult.warning);
      }
    } catch (calErr) {
      console.error("[Google Calendar Integration Exception]:", calErr);
    }

    const historyItems = [
      {
        timestamp: now,
        action: isPaid
          ? `Appointment booked & payment of ₹${price} confirmed via Razorpay (ID: ${body.razorpayPaymentId || body.razorpay_payment_id})`
          : "Booking request submitted via website",
      },
    ];

    if (calendarEventId) {
      historyItems.unshift({
        timestamp: now,
        action: `Google Calendar invitation dispatched & Google Meet generated (${calendarEventId})`,
      });
    }

    const newBooking: Booking = {
      id: bookingId,
      clientName,
      clientEmail,
      clientPhone,
      serviceId: matchedService ? matchedService.id : "serv_1",
      serviceName: finalServiceName,
      appointmentDate,
      appointmentTime,
      durationMinutes,
      format,
      bookingStatus: body.bookingStatus || "confirmed",
      paymentStatus: body.paymentStatus || (isPaid ? "paid" : "pending"),
      razorpayOrderId: body.razorpayOrderId || body.razorpay_order_id,
      razorpayPaymentId: body.razorpayPaymentId || body.razorpay_payment_id,
      razorpaySignature: body.razorpaySignature || body.razorpay_signature,
      price,
      meetingLink,
      calendarEventId,
      clientMessage,
      history: historyItems,
      provider: "internal",
      createdAt: now,
      updatedAt: now,
    };

    db.bookings.unshift(newBooking);

    // Create Notification for Admin
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "booking_new",
      title: isPaid ? "New Paid Booking Confirmed" : "New Booking Request",
      message: `${newBooking.clientName} booked "${newBooking.serviceName}" for ${newBooking.appointmentDate} at ${newBooking.appointmentTime}${isPaid ? " (Payment Paid via Razorpay)" : ""}.${calendarEventId ? " Google Meet room ready." : ""}`,
      link: "/admin/bookings",
      isRead: false,
      createdAt: now,
    });

    await saveDatabase(db);

    // Also persist directly to relational PostgreSQL table if accessible
    try {
      const pool = getPgPool();
      await pool.query(
        `INSERT INTO bookings (
          id, client_name, client_email, client_phone, service_id,
          appointment_date, appointment_time, duration_minutes, meeting_format,
          status, payment_status, price, meeting_link, client_notes,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          meeting_link = EXCLUDED.meeting_link,
          status = EXCLUDED.status,
          payment_status = EXCLUDED.payment_status,
          updated_at = EXCLUDED.updated_at`,
        [
          newBooking.id,
          newBooking.clientName,
          newBooking.clientEmail,
          newBooking.clientPhone,
          newBooking.serviceId,
          newBooking.appointmentDate,
          newBooking.appointmentTime,
          newBooking.durationMinutes,
          newBooking.format,
          newBooking.bookingStatus,
          newBooking.paymentStatus,
          newBooking.price,
          newBooking.meetingLink,
          newBooking.clientMessage,
          now,
          now,
        ]
      );
    } catch (sqlErr) {
      console.warn("[PostgreSQL Booking Insert Error]:", sqlErr);
    }

    // Dispatch email notifications (non-blocking for client response reliability)
    try {
      await Promise.allSettled([
        sendBookingConfirmationToClient({
          bookingId: newBooking.id,
          clientName: newBooking.clientName,
          clientEmail: newBooking.clientEmail,
          clientPhone: newBooking.clientPhone,
          serviceName: newBooking.serviceName,
          appointmentDate: newBooking.appointmentDate,
          appointmentTime: newBooking.appointmentTime,
          format: newBooking.format,
          price: newBooking.price,
          paymentStatus: newBooking.paymentStatus,
          meetingLink: newBooking.meetingLink,
          clientMessage: newBooking.clientMessage,
        }),
        sendBookingAlertToAdmin({
          bookingId: newBooking.id,
          clientName: newBooking.clientName,
          clientEmail: newBooking.clientEmail,
          clientPhone: newBooking.clientPhone,
          serviceName: newBooking.serviceName,
          appointmentDate: newBooking.appointmentDate,
          appointmentTime: newBooking.appointmentTime,
          format: newBooking.format,
          price: newBooking.price,
          paymentStatus: newBooking.paymentStatus,
          meetingLink: newBooking.meetingLink,
          clientMessage: newBooking.clientMessage,
        }),
      ]);
    } catch (emailErr) {
      console.error("[Email Notification Error - Booking]:", emailErr);
    }

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
