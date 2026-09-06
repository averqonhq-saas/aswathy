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
    const service = db.services.find((s) => s.id === id && !s.deletedAt);

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Get service error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(
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
    const service = db.services.find((s) => s.id === id && !s.deletedAt);

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    const category = body.categoryId
      ? db.serviceCategories.find((c) => c.id === body.categoryId)
      : null;

    service.name = body.name || service.name;
    if (body.categoryId) {
      service.categoryId = body.categoryId;
      service.categoryName = category ? category.name : service.categoryName;
    }
    service.shortDescription = body.shortDescription || service.shortDescription;
    service.fullDescription = body.fullDescription || service.fullDescription;
    if (body.durationMinutes) {
      service.durationMinutes = parseInt(body.durationMinutes, 10);
    }
    if (body.price !== undefined) {
      service.price = parseFloat(body.price);
    }
    if (body.image) {
      service.image = body.image;
    }
    if (body.status) {
      service.status = body.status;
    }
    service.updatedAt = new Date().toISOString();

    await saveDatabase(db);
    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("Update service error:", error);
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
    const service = db.services.find((s) => s.id === id && !s.deletedAt);

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    if (body.status) {
      service.status = body.status;
      service.updatedAt = new Date().toISOString();
      await saveDatabase(db);
    }

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("Toggle service error:", error);
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
    const service = db.services.find((s) => s.id === id);

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    // Soft delete
    service.deletedAt = new Date().toISOString();
    service.status = "disabled";
    await saveDatabase(db);

    return NextResponse.json({ success: true, message: "Service removed." });
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
