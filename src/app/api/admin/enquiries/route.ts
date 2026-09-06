import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, Enquiry } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const db = await getDatabase();
    let enquiries = db.enquiries.filter((e) => !e.deletedAt);

    if (status && status !== "all") {
      enquiries = enquiries.filter((e) => e.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      enquiries = enquiries.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.message.toLowerCase().includes(q)
      );
    }

    enquiries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("Enquiries GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const newEnquiry: Enquiry = {
      id: `enq_${Date.now()}`,
      name,
      email,
      phone: phone || "",
      subject: subject || "General Practice Inquiry",
      message,
      status: "new",
      internalNotes: "",
      createdAt: now,
      updatedAt: now,
    };

    db.enquiries.unshift(newEnquiry);

    // Create notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "enquiry_new",
      title: "New Client Enquiry",
      message: `${name}: ${subject || "Consultation question"}`,
      link: "/admin/enquiries",
      isRead: false,
      createdAt: now,
    });

    await saveDatabase(db);
    return NextResponse.json({ success: true, enquiry: newEnquiry }, { status: 201 });
  } catch (error) {
    console.error("Create enquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry." },
      { status: 500 }
    );
  }
}
