import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, MediaItem } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const db = await getDatabase();
    let media = [...db.media];

    if (category && category !== "all") {
      media = media.filter((m) => m.category === category);
    }

    media.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, url, category } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and image URL are required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const newMedia: MediaItem = {
      id: `med_${Date.now()}`,
      filename: title.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".jpg",
      title,
      url,
      category: category || "website",
      mimeType: "image/jpeg",
      sizeBytes: 150000,
      createdAt: now,
      updatedAt: now,
    };

    db.media.unshift(newMedia);
    await saveDatabase(db);

    return NextResponse.json({ success: true, media: newMedia }, { status: 201 });
  } catch (error) {
    console.error("Media POST error:", error);
    return NextResponse.json({ error: "Failed to add media." }, { status: 500 });
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
      return NextResponse.json({ error: "Media ID required." }, { status: 400 });
    }

    const db = await getDatabase();
    db.media = db.media.filter((m) => m.id !== id);
    await saveDatabase(db);

    return NextResponse.json({ success: true, message: "Media removed." });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
