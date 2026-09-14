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
    const rawBody = await request.text();
    const webhookSignature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Verify webhook signature if secret configured
    if (webhookSecret && webhookSignature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== webhookSignature) {
        console.error("[Razorpay Webhook] Invalid webhook signature.");
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const event = payload.event;
    console.info(`[Razorpay Webhook Received]: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const receipt = payload.payload?.order?.entity?.receipt;

      if (!orderId && !receipt) {
        return NextResponse.json({ received: true, note: "No order or receipt identifier" });
      }

      const db = await getDatabase();
      const bookingIndex = db.bookings.findIndex(
        (b) =>
          (orderId && b.razorpayOrderId === orderId) ||
          (receipt && b.id === receipt)
      );

      if (bookingIndex === -1) {
        console.warn(
          `[Razorpay Webhook] No matching booking found for order ${orderId} / receipt ${receipt}`
        );
        return NextResponse.json({ received: true, note: "Booking not found" });
      }

      const booking = db.bookings[bookingIndex];

      // Idempotency: if already confirmed and paid, do not re-trigger
      if (booking.paymentStatus === "paid" && booking.bookingStatus === "confirmed") {
        console.info(`[Razorpay Webhook] Booking ${booking.id} is already confirmed.`);
        return NextResponse.json({ received: true, note: "Already processed" });
      }

      const now = new Date().toISOString();

      // Create Google Calendar & Meet link
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
        }
      } catch (calErr: any) {
        console.error("[Razorpay Webhook Calendar Error]:", calErr?.message || calErr);
      }

      // Update booking
      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";
      booking.razorpayPaymentId = paymentId || booking.razorpayPaymentId;
      booking.meetingLink = meetingLink;
      booking.calendarEventId = calendarEventId;
      booking.googleEventId = calendarEventId;
      booking.updatedAt = now;

      if (!booking.history) booking.history = [];
      booking.history.unshift({
        timestamp: now,
        action: `Payment captured via Razorpay Webhook (Payment ID: ${paymentId}). Appointment confirmed.`,
      });

      await saveDatabase(db);

      // Update Supabase PostgreSQL table
      try {
        const pool = getPgPool();
        await pool.query(
          `UPDATE bookings SET
            status = 'confirmed',
            payment_status = 'paid',
            razorpay_payment_id = $1,
            meeting_link = $2,
            google_event_id = $3,
            updated_at = NOW()
          WHERE id = $4`,
          [paymentId, meetingLink, calendarEventId || null, booking.id]
        );
      } catch (pgErr) {
        console.warn("[PostgreSQL Webhook Update Error]:", pgErr);
      }

      // Dispatch notifications in parallel
      await Promise.allSettled([
        sendWhatsAppConfirmation({
          phone: booking.clientPhone,
          customerName: booking.clientName,
          serviceName: booking.serviceName,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          meetingLink: booking.meetingLink,
        }),
        sendBookingConfirmationToClient({
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
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Razorpay Webhook Error]:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handling failed" },
      { status: 500 }
    );
  }
}
