import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import type { ServiceCategory } from "@/lib/types";

export async function GET() {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    return NextResponse.json({
      success: true,
      categories: db.serviceCategories || [],
    });
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
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
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const trimmedName = name.trim();

    // Check duplicate
    const existing = (db.serviceCategories || []).find(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists.", category: existing },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newCategory: ServiceCategory = {
      id: `cat_${Date.now()}`,
      name: trimmedName,
      slug: slug || `category-${Date.now()}`,
      description: (description || "").trim(),
      createdAt: now,
      updatedAt: now,
    };

    if (!db.serviceCategories) {
      db.serviceCategories = [];
    }

    db.serviceCategories.push(newCategory);
    await saveDatabase(db);

    return NextResponse.json(
      { success: true, category: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    // Check if services are using this category
    const countUsing = (db.services || []).filter(
      (s) => s.categoryId === id && !s.deletedAt
    ).length;

    if (countUsing > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category: ${countUsing} active service(s) are currently assigned to it. Please reassign those services first.`,
        },
        { status: 400 }
      );
    }

    db.serviceCategories = (db.serviceCategories || []).filter((c) => c.id !== id);
    await saveDatabase(db);

    return NextResponse.json({ success: true, message: "Category deleted." });
  } catch (error) {
    console.error("Admin categories DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}
