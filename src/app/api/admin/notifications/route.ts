import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const notifications = [...db.notifications].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, id } = body;

    const db = await getDatabase();

    if (action === "mark_all_read") {
      db.notifications.forEach((n) => (n.isRead = true));
    } else if (id) {
      const target = db.notifications.find((n) => n.id === id);
      if (target) target.isRead = true;
    }

    await saveDatabase(db);
    return NextResponse.json({ success: true, notifications: db.notifications });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
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

    const db = await getDatabase();
    if (id === "all") {
      db.notifications = [];
    } else if (id) {
      db.notifications = db.notifications.filter((n) => n.id !== id);
    }

    await saveDatabase(db);
    return NextResponse.json({ success: true, message: "Notifications cleared." });
  } catch (error) {
    console.error("Notifications DELETE error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
