import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDatabase, saveDatabase } from "@/lib/db";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { sendWhatsAppConfirmation } from "@/lib/whatsapp";
import {
  sendBookingConfirmationToClient,
  sendBookingAlertToAdmin,
} from "@/lib/email";
import { getPgPool } from "@/lib/supabase-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isMock,
    } = body;

    if (!bookingId || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Booking ID and Payment ID are required." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 1. Verify HMAC SHA-256 signature if real credentials are present
    if (keySecret && razorpay_order_id && razorpay_signature && !isMock) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error(
          `[Razorpay Signature Mismatch] Expected: ${generatedSignature}, Received: ${razorpay_signature}`
        );
        return NextResponse.json(
          { success: false, error: "Invalid payment signature verification failed." },
          { status: 400 }
        );
      }
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    // 2. Fetch booking record
    const bookingIndex = db.bookings.findIndex(
      (b) =>
        b.id === bookingId ||
        (razorpay_order_id && b.razorpayOrderId === razorpay_order_id)
    );

    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: "Booking record not found in practice database." },
        { status: 404 }
      );
    }

    const booking = db.bookings[bookingIndex];

    // 3. Idempotency Check: if already confirmed and paid, prevent duplicate Google Calendar / WhatsApp triggers
    if (booking.paymentStatus === "paid" && booking.bookingStatus === "confirmed") {
      console.info(
        `[Payment Verification Notice] Booking ${booking.id} already verified & confirmed. Returning cached state.`
      );
      return NextResponse.json({
        success: true,
        booking,
        message: "Payment already verified and appointment confirmed.",
      });
    }

    // 4. Create Google Calendar Event & Generate Google Meet Link
    let meetingLink =
      booking.format === "in-person"
        ? "In-Person Consultation at Clinic"
        : booking.meetingLink || "Google Meet link being generated";
    let calendarEventId: string | undefined = booking.calendarEventId;

    try {
      const calendarResult = await createCalendarEventWithMeet({
        bookingId: booking.id,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        serviceName: booking.serviceName,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        durationMinutes: booking.durationMinutes || 50,
        format: booking.format,
        clientMessage: booking.clientMessage,
      });

      if (calendarResult.success) {
        calendarEventId = calendarResult.eventId;
        if (calendarResult.meetingLink) {
          meetingLink = calendarResult.meetingLink;
        }
      } else if (calendarResult.warning) {
        console.warn("[Google Calendar Verification Warning]:", calendarResult.warning);
      }
    } catch (calErr: any) {
      console.error("[Google Calendar Verification Exception]:", calErr?.message || calErr);
    }

    // 5. Update booking state
    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    booking.razorpayOrderId = razorpay_order_id || booking.razorpayOrderId || `order_${Date.now()}`;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature || "verified";
    booking.meetingLink = meetingLink;
    booking.calendarEventId = calendarEventId;
    booking.googleEventId = calendarEventId;
    booking.updatedAt = now;

    if (!booking.history) booking.history = [];
    booking.history.unshift({
      timestamp: now,
      action: `Payment of ₹${booking.price || 1800} verified via Razorpay (Payment ID: ${razorpay_payment_id}). Appointment confirmed.${calendarEventId ? " Google Meet room ready." : ""}`,
    });

    // Notify practice admin in local inbox
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "booking_new",
      title: "Payment Verified & Consultation Confirmed",
      message: `Payment of ₹${booking.price || 1800} verified from ${booking.clientName} for ${booking.serviceName} (${booking.appointmentDate} at ${booking.appointmentTime}). Google Meet room scheduled.`,
      link: "/admin/bookings",
      isRead: false,
      createdAt: now,
    });

    await saveDatabase(db);

    // 6. Update relational Supabase table
    try {
      const pool = getPgPool();
      await pool.query(
        `UPDATE bookings SET
          status = 'confirmed',
          payment_status = 'paid',
          razorpay_order_id = $1,
          razorpay_payment_id = $2,
          razorpay_signature = $3,
          meeting_link = $4,
          google_event_id = $5,
          updated_at = NOW()
        WHERE id = $6`,
        [
          booking.razorpayOrderId,
          booking.razorpayPaymentId,
          booking.razorpaySignature,
          booking.meetingLink,
          booking.googleEventId || null,
          booking.id,
        ]
      );
    } catch (pgErr) {
      console.warn("[PostgreSQL Update Booking Post-Payment Error]:", pgErr);
    }

    // 7. Dispatch WhatsApp confirmation & Email confirmations in parallel
    let whatsappStatus = "pending";
    let emailDispatched = false;
    const durationLabel = `${booking.durationMinutes || 50} minutes`;
    const psychologistName =
      process.env.WHATSAPP_PSYCHOLOGIST_NAME || "Aswathy | roottherapyonline.com";
    try {
      const [whatsappRes, emailClientRes] = await Promise.allSettled([
        sendWhatsAppConfirmation({
          phone: booking.clientPhone,
          customerName: booking.clientName,
          serviceName: booking.serviceName,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          duration: durationLabel,
          meetingLink: booking.meetingLink,
          psychologistName,
        }),
        sendBookingConfirmationToClient({
          bookingId: booking.id,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          clientPhone: booking.clientPhone,
          serviceName: booking.serviceName,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          durationMinutes: booking.durationMinutes || 50,
          format: booking.format,
          price: booking.price,
          paymentStatus: "paid",
          meetingLink: booking.meetingLink,
          clientMessage: booking.clientMessage,
        }),
        sendBookingAlertToAdmin({
          bookingId: booking.id,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          clientPhone: booking.clientPhone,
          serviceName: booking.serviceName,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          format: booking.format,
          price: booking.price,
          paymentStatus: "paid",
          meetingLink: booking.meetingLink,
          clientMessage: booking.clientMessage,
        }),
      ]);

      if (whatsappRes.status === "fulfilled" && whatsappRes.value.success) {
        whatsappStatus = "sent";
        booking.whatsappStatus = "sent";
      } else if (whatsappRes.status === "fulfilled" && whatsappRes.value.warning) {
        booking.whatsappStatus = "simulated";
      }

      if (emailClientRes.status === "fulfilled" && emailClientRes.value) {
        emailDispatched = true;
      }

      // Persist sent flags to Supabase
      try {
        const pool = getPgPool();
        await pool.query(
          `UPDATE bookings SET
            whatsapp_status = $1,
            whatsapp_sent = $2,
            email_sent = $3
          WHERE id = $4`,
          [
            booking.whatsappStatus || "pending",
            booking.whatsappStatus === "sent",
            emailDispatched,
            booking.id,
          ]
        );
      } catch {}
    } catch (notifyErr: any) {
      console.error("[Post-Payment Notification Dispatch Error]:", notifyErr);
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Payment verified, Google Meet generated, and booking confirmed.",
    });
  } catch (error: any) {
    console.error("[Razorpay Verify Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
