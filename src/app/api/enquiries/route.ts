import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, Enquiry } from "@/lib/db";
import { sendEnquiryNotificationToAdmin, sendEnquiryAutoReplyToClient } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter your message or question." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const newEnquiry: Enquiry = {
      id: `enq_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: (phone || "").trim(),
      subject: (subject || "General Consultation Inquiry").trim(),
      message: message.trim(),
      status: "new",
      internalNotes: "",
      createdAt: now,
      updatedAt: now,
    };

    db.enquiries.unshift(newEnquiry);

    // Create practitioner notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "enquiry_new",
      title: "New Client Enquiry",
      message: `${newEnquiry.name}: ${newEnquiry.subject}`,
      link: "/admin/enquiries",
      isRead: false,
      createdAt: now,
    });

    await saveDatabase(db);

    // Dispatch email notifications (non-blocking for client response reliability)
    try {
      await Promise.allSettled([
        sendEnquiryNotificationToAdmin(newEnquiry),
        sendEnquiryAutoReplyToClient(newEnquiry),
      ]);
    } catch (emailErr) {
      console.error("[Email Notification Error - Enquiry]:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your enquiry has been received. Aswathy will get back to you shortly.",
        enquiry: newEnquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public Enquiry submission error:", error);
    return NextResponse.json(
      { error: "Unable to submit your enquiry. Please try again or reach out directly." },
      { status: 500 }
    );
  }
}
