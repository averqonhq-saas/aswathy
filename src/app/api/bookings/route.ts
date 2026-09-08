import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, Booking } from "@/lib/db";

export async function POST(request: Request) {
  try {
    let body: Record<string, any> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        body = await request.json();
      } catch {
        const text = await request.text();
        try {
          body = JSON.parse(text);
        } catch {
          body = {};
        }
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

    const format = body.format || "online";
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

    const newBooking: Booking = {
      id: bookingId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone ? clientPhone.trim() : "+91 (Not Provided)",
      serviceId: matchedService ? matchedService.id : "serv_1",
      serviceName: matchedService
        ? matchedService.name
        : serviceName || "Individual Consultation",
      appointmentDate,
      appointmentTime,
      durationMinutes: matchedService ? matchedService.durationMinutes : (body.durationMinutes || 50),
      format: (format === "in-person" || format === "studio" || format === "offline") ? "in-person" : "online",
      bookingStatus: "pending",
      paymentStatus: "pending",
      price: matchedService ? matchedService.price : (body.price || 1800),
      meetingLink: "Google Meet link will be generated prior to appointment",
      clientMessage: clientMessage || "",
      history: [
        {
          timestamp: now,
          action: "Booking request submitted via website",
        },
      ],
      provider: "internal",
      createdAt: now,
      updatedAt: now,
    };

    db.bookings.unshift(newBooking);

    // Create Notification for Admin
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "booking_new",
      title: "New Booking Request",
      message: `${newBooking.clientName} scheduled "${newBooking.serviceName}" for ${newBooking.appointmentDate} at ${newBooking.appointmentTime}.`,
      link: "/admin/bookings",
      isRead: false,
      createdAt: now,
    });

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
