import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDatabase();
    const enquiry = db.enquiries.find((e) => e.id === id && !e.deletedAt);

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ enquiry });
  } catch (error) {
    console.error("Get enquiry error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();
    const enquiry = db.enquiries.find((e) => e.id === id && !e.deletedAt);

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (body.status) {
      enquiry.status = body.status;
    }
    if (body.internalNotes !== undefined) {
      enquiry.internalNotes = body.internalNotes;
    }
    enquiry.updatedAt = new Date().toISOString();

    await saveDatabase(db);
    return NextResponse.json({ success: true, enquiry });
  } catch (error) {
    console.error("Update enquiry error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDatabase();
    const enquiry = db.enquiries.find((e) => e.id === id);

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    enquiry.deletedAt = new Date().toISOString();
    await saveDatabase(db);

    return NextResponse.json({ success: true, message: "Enquiry deleted." });
  } catch (error) {
    console.error("Delete enquiry error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
