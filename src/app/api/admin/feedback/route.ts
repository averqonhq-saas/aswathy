import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, ClientFeedback } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const feedback = db.feedback
      .filter((f) => !f.deletedAt)
      .sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Feedback GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientDisplayName,
      feedback: feedbackText,
      rating,
      date,
      isAnonymous,
      status,
      publicVisibility,
    } = body;

    if (!feedbackText) {
      return NextResponse.json(
        { error: "Feedback content is required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const newFeedback: ClientFeedback = {
      id: `fb_${Date.now()}`,
      clientDisplayName: clientDisplayName || "Anonymous Client",
      feedback: feedbackText,
      rating: Math.min(5, Math.max(1, parseInt(rating || "5", 10))),
      date: date || now.split("T")[0],
      isAnonymous: Boolean(isAnonymous),
      status: status || "approved",
      publicVisibility: publicVisibility !== undefined ? Boolean(publicVisibility) : true,
      createdAt: now,
      updatedAt: now,
    };

    db.feedback.unshift(newFeedback);
    await saveDatabase(db);

    return NextResponse.json({ success: true, feedback: newFeedback }, { status: 201 });
  } catch (error) {
    console.error("Create feedback error:", error);
    return NextResponse.json(
      { error: "Failed to create feedback." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, publicVisibility, feedback: feedbackText, clientDisplayName, rating, isAnonymous } = body;

    if (!id) {
      return NextResponse.json({ error: "Feedback ID required." }, { status: 400 });
    }

    const db = await getDatabase();
    const item = db.feedback.find((f) => f.id === id && !f.deletedAt);

    if (!item) {
      return NextResponse.json({ error: "Feedback not found." }, { status: 404 });
    }

    if (status) item.status = status;
    if (publicVisibility !== undefined) item.publicVisibility = Boolean(publicVisibility);
    if (feedbackText !== undefined) item.feedback = feedbackText;
    if (clientDisplayName !== undefined) item.clientDisplayName = clientDisplayName;
    if (rating !== undefined) item.rating = parseInt(rating, 10);
    if (isAnonymous !== undefined) item.isAnonymous = Boolean(isAnonymous);
    item.updatedAt = new Date().toISOString();

    await saveDatabase(db);
    return NextResponse.json({ success: true, feedback: item });
  } catch (error) {
    console.error("Update feedback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Feedback ID required." }, { status: 400 });
    }

    const db = await getDatabase();
    const item = db.feedback.find((f) => f.id === id);

    if (!item) {
      return NextResponse.json({ error: "Feedback not found." }, { status: 404 });
    }

    item.deletedAt = new Date().toISOString();
    await saveDatabase(db);

    return NextResponse.json({ success: true, message: "Feedback removed." });
  } catch (error) {
    console.error("Delete feedback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
