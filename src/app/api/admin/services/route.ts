import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, Service } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const services = db.services
      .filter((s) => !s.deletedAt)
      .sort((a, b) => a.order - b.order);

    return NextResponse.json({
      services,
      categories: db.serviceCategories,
    });
  } catch (error) {
    console.error("Services GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services." },
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
      name,
      categoryId,
      shortDescription,
      fullDescription,
      durationMinutes,
      price,
      image,
      status,
    } = body;

    if (!name || !categoryId || !shortDescription) {
      return NextResponse.json(
        { error: "Name, category, and short description are required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const category = db.serviceCategories.find((c) => c.id === categoryId);
    const now = new Date().toISOString();

    const newService: Service = {
      id: `svc_${Date.now()}`,
      name,
      categoryId,
      categoryName: category ? category.name : "Individual Counselling",
      shortDescription,
      fullDescription: fullDescription || shortDescription,
      durationMinutes: parseInt(durationMinutes || "50", 10),
      price: parseFloat(price || "1800"),
      image:
        image ||
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
      status: status || "active",
      order: db.services.length + 1,
      createdAt: now,
      updatedAt: now,
    };

    db.services.push(newService);
    await saveDatabase(db);

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (error) {
    console.error("Services POST error:", error);
    return NextResponse.json(
      { error: "Failed to create service." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Invalid ordered list" }, { status: 400 });
    }

    const db = await getDatabase();
    orderedIds.forEach((id: string, index: number) => {
      const svc = db.services.find((s) => s.id === id);
      if (svc) {
        svc.order = index + 1;
        svc.updatedAt = new Date().toISOString();
      }
    });

    await saveDatabase(db);
    return NextResponse.json({ success: true, message: "Services reordered." });
  } catch (error) {
    console.error("Services reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder services." },
      { status: 500 }
    );
  }
}
