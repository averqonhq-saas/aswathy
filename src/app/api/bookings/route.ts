import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, getBookedSlots, Booking } from "@/lib/db";
import { areSlotsMatching } from "@/lib/booking-config";
import { sendBookingConfirmationToClient, sendBookingAlertToAdmin } from "@/lib/email";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { getPgPool } from "@/lib/supabase-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const bookedSlots = await getBookedSlots(date);

    return NextResponse.json({
      success: true,
      bookedSlots,
    });
  } catch (error: any) {
    console.error("[Public Bookings GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve booked slots.", details: error?.message },
      { status: 500 }
    );
  }
}

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

    // Check if the appointment date is on leave or marked as off-day
    const dayOverride = db.bookingFormConfig?.singleDaySlots?.find(
      (s) => s.date === appointmentDate
    );
    const isLeaveInConfig =
      dayOverride &&
      (dayOverride.isOffDay ||
        (Array.isArray(dayOverride.slots) && dayOverride.slots.length === 0));
    const isBlockedFullDay = db.blockedSlots?.some(
      (b) =>
        b.date === appointmentDate &&
        (b.type === "full_day" || b.type === "all_day" || b.type === "holiday")
    );

    if (isLeaveInConfig || isBlockedFullDay) {
      const reason =
        dayOverride?.leaveReason ||
        dayOverride?.note ||
        db.blockedSlots?.find((b) => b.date === appointmentDate)?.title ||
        "Therapist is on leave";
      return NextResponse.json(
        {
          error: `No consultation slots are available on ${appointmentDate}. The therapist is on leave (${reason}). Please choose an alternate date.`,
        },
        { status: 400 }
      );
    }

    // Check if the specific slot is blocked by admin
    const isSlotBlocked = db.blockedSlots?.some(
      (b) =>
        b.date === appointmentDate &&
        b.type === "slot" &&
        b.startTime &&
        areSlotsMatching(b.startTime, appointmentTime)
    );

    if (isSlotBlocked) {
      return NextResponse.json(
        {
          error: `The consultation slot at ${appointmentTime} on ${appointmentDate} is unavailable. Please select an alternate slot.`,
        },
        { status: 409 }
      );
    }

    // Check if slot has already been booked by an active appointment
    const activeBookedSlots = await getBookedSlots(appointmentDate);
    const isSlotAlreadyBooked = activeBookedSlots.some((b) =>
      areSlotsMatching(b.time, appointmentTime)
    );

    if (isSlotAlreadyBooked) {
      // Check if it's the same client resubmitting their own identical booking
      const sameClientBooking = db.bookings.find(
        (b) =>
          b.clientEmail.toLowerCase() === clientEmail.toLowerCase() &&
          b.appointmentDate === appointmentDate &&
          areSlotsMatching(b.appointmentTime, appointmentTime) &&
          !b.deletedAt
      );
      if (sameClientBooking) {
        return NextResponse.json({
          success: true,
          message: "Booking already registered in practice database.",
          booking: sameClientBooking,
        });
      }

      return NextResponse.json(
        {
          error: `The consultation slot at ${appointmentTime} on ${appointmentDate} has already been reserved by another client. Please select an alternate time slot.`,
        },
        { status: 409 }
      );
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
    const requiresPayment =
      db.bookingFormConfig?.enablePayment !== false &&
      !isPaid &&
      (body.paymentStatus === "pending" || !body.paymentStatus);

    let meetingLink: string | undefined = undefined;
    let calendarEventId: string | undefined = undefined;

    // Only generate Google Calendar Event & Meet link if booking is already confirmed (e.g. payment disabled or already verified)
    if (!requiresPayment) {
      if (format === "in-person") {
        meetingLink = "In-Person Consultation at Clinic";
      }

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
    }

    const historyItems = [
      {
        timestamp: now,
        action: isPaid
          ? `Appointment booked & payment of ₹${price} confirmed via Razorpay (ID: ${body.razorpayPaymentId || body.razorpay_payment_id})`
          : requiresPayment
          ? `Pending appointment slot reserved (Awaiting Razorpay payment of ₹${price})`
          : "Booking request submitted via website",
      },
    ];

    if (calendarEventId) {
      historyItems.unshift({
        timestamp: now,
        action: `Google Calendar invitation dispatched & Google Meet generated (${calendarEventId})`,
      });
    }

    const finalBookingStatus = requiresPayment ? "pending" : (body.bookingStatus || "confirmed");
    const finalPaymentStatus = requiresPayment ? "pending" : (body.paymentStatus || (isPaid ? "paid" : "pending"));

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
      bookingStatus: finalBookingStatus,
      paymentStatus: finalPaymentStatus,
      razorpayOrderId: body.razorpayOrderId || body.razorpay_order_id,
      razorpayPaymentId: body.razorpayPaymentId || body.razorpay_payment_id,
      razorpaySignature: body.razorpaySignature || body.razorpay_signature,
      price,
      meetingLink,
      calendarEventId,
      googleEventId: calendarEventId,
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
      title: isPaid
        ? "New Paid Booking Confirmed"
        : requiresPayment
        ? "New Booking Slot Reserved (Pending Payment)"
        : "New Booking Request",
      message: `${newBooking.clientName} booked "${newBooking.serviceName}" for ${newBooking.appointmentDate} at ${newBooking.appointmentTime}${isPaid ? " (Payment Paid via Razorpay)" : requiresPayment ? " (Payment Pending)" : ""}.${calendarEventId ? " Google Meet room ready." : ""}`,
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
          status, payment_status, price, meeting_link, razorpay_order_id, razorpay_payment_id,
          client_notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          meeting_link = EXCLUDED.meeting_link,
          status = EXCLUDED.status,
          payment_status = EXCLUDED.payment_status,
          razorpay_order_id = EXCLUDED.razorpay_order_id,
          razorpay_payment_id = EXCLUDED.razorpay_payment_id,
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
          newBooking.meetingLink || null,
          newBooking.razorpayOrderId || null,
          newBooking.razorpayPaymentId || null,
          newBooking.clientMessage,
          now,
          now,
        ]
      );
    } catch (sqlErr) {
      console.warn("[PostgreSQL Booking Insert Error]:", sqlErr);
    }

    // Only dispatch confirmation emails if booking is confirmed (not pending payment)
    if (!requiresPayment) {
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
    }

    return NextResponse.json(
      {
        success: true,
        message: requiresPayment
          ? "Slot reserved successfully. Proceed to payment."
          : "Booking recorded successfully in practice database.",
        bookingId: newBooking.id,
        booking: newBooking,
        requiresPayment,
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
