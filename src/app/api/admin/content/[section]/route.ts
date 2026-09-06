import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section } = await params;
    const db = await getDatabase();

    switch (section) {
      case "about":
        return NextResponse.json({ data: db.websiteAbout });

      case "journey":
        return NextResponse.json({
          data: [...db.journeyEntries].sort((a, b) => a.order - b.order),
        });

      case "session":
        return NextResponse.json({
          data: [...db.sessionSteps].sort((a, b) => a.order - b.order),
        });

      case "client-types":
        return NextResponse.json({
          data: [...db.clientTypes].sort((a, b) => a.order - b.order),
        });

      default:
        return NextResponse.json(
          { error: `Unknown content section: ${section}` },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error("Content GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section } = await params;
    const body = await request.json();
    const db = await getDatabase();
    const now = new Date().toISOString();

    switch (section) {
      case "about": {
        db.websiteAbout = {
          ...db.websiteAbout,
          ...body,
          updatedAt: now,
        };
        await saveDatabase(db);
        return NextResponse.json({ success: true, data: db.websiteAbout });
      }

      case "journey": {
        if (Array.isArray(body.items)) {
          db.journeyEntries = body.items.map((item: any, idx: number) => ({
            id: item.id || `jrn_${Date.now()}_${idx}`,
            year: item.year || "",
            heading: item.heading || "",
            description: item.description || "",
            order: idx + 1,
            createdAt: item.createdAt || now,
            updatedAt: now,
          }));
          await saveDatabase(db);
        }
        return NextResponse.json({ success: true, data: db.journeyEntries });
      }

      case "session": {
        if (Array.isArray(body.items)) {
          db.sessionSteps = body.items.map((item: any, idx: number) => ({
            id: item.id || `step_${Date.now()}_${idx}`,
            stepNumber: item.stepNumber || `0${idx + 1}`.slice(-2),
            title: item.title || "",
            description: item.description || "",
            isActive: item.isActive !== undefined ? item.isActive : true,
            order: idx + 1,
            createdAt: item.createdAt || now,
            updatedAt: now,
          }));
          await saveDatabase(db);
        }
        return NextResponse.json({ success: true, data: db.sessionSteps });
      }

      case "client-types": {
        if (Array.isArray(body.items)) {
          db.clientTypes = body.items.map((item: any, idx: number) => ({
            id: item.id || `ct_${Date.now()}_${idx}`,
            title: item.title || "",
            description: item.description || "",
            isActive: item.isActive !== undefined ? item.isActive : true,
            order: idx + 1,
            createdAt: item.createdAt || now,
            updatedAt: now,
          }));
          await saveDatabase(db);
        }
        return NextResponse.json({ success: true, data: db.clientTypes });
      }

      default:
        return NextResponse.json(
          { error: `Unknown section: ${section}` },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error("Content PUT error:", error);
    return NextResponse.json({ error: "Failed to update content." }, { status: 500 });
  }
}
