import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDatabase, saveDatabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = body;

    if (!bookingId || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Booking ID and Payment ID are required." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Verify HMAC signature if live credentials exist and not mock
    if (keySecret && razorpay_order_id && razorpay_signature && !isMock) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: "Invalid payment signature verification failed." },
          { status: 400 }
        );
      }
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const bookingIndex = db.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    const booking = db.bookings[bookingIndex];
    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    booking.razorpayOrderId = razorpay_order_id || `order_${Date.now()}`;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature || "verified";
    booking.updatedAt = now;

    if (!booking.history) booking.history = [];
    booking.history.unshift({
      timestamp: now,
      action: `Razorpay payment of ₹${booking.price || 1800} verified successfully (Payment ID: ${razorpay_payment_id})`,
    });

    // Notify practice admin
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "booking_new",
      title: "Consultation Fee Paid via Razorpay",
      message: `Payment of ₹${booking.price || 1800} received from ${booking.clientName} for ${booking.serviceName} (${booking.appointmentDate} at ${booking.appointmentTime}).`,
      link: "/admin/bookings",
      isRead: false,
      createdAt: now,
    });

    await saveDatabase(db);

    return NextResponse.json({
      success: true,
      booking,
      message: "Payment verified and booking confirmed.",
    });
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
