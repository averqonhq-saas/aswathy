import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getGalleryEvents,
  getGalleryEventById,
  createGalleryEvent,
  updateGalleryEvent,
  deleteGalleryEvent,
} from "@/lib/db";
import { GALLERY_CATEGORIES, generateEventSlug } from "@/lib/gallery-data";

export async function GET(request: Request) {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const status = (searchParams.get("status") as "published" | "draft" | "all") || "all";
    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") as "newest" | "oldest") || "newest";

    const events = await getGalleryEvents({
      status,
      category,
      search,
      sortBy,
    });

    return NextResponse.json({
      events,
      totalCount: events.length,
      categories: GALLERY_CATEGORIES,
    });
  } catch (error) {
    console.error("Admin Gallery GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
      title,
      slug,
      category,
      role,
      institution,
      shortDescription,
      description,
      eventDate,
      location,
      topics,
      coverImage,
      galleryImages,
      isFeatured,
      status,
    } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Event title is required." },
        { status: 400 }
      );
    }
    if (!category?.trim()) {
      return NextResponse.json(
        { error: "Event category is required." },
        { status: 400 }
      );
    }
    if (!role?.trim()) {
      return NextResponse.json(
        { error: "Professional role is required." },
        { status: 400 }
      );
    }
    if (!institution?.trim()) {
      return NextResponse.json(
        { error: "Institution or organization is required." },
        { status: 400 }
      );
    }
    if (!shortDescription?.trim()) {
      return NextResponse.json(
        { error: "Short description is required." },
        { status: 400 }
      );
    }
    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Full description is required." },
        { status: 400 }
      );
    }
    if (!coverImage?.trim()) {
      return NextResponse.json(
        { error: "Cover image is required." },
        { status: 400 }
      );
    }

    const parsedTopics = Array.isArray(topics)
      ? topics.map((t: any) => String(t).trim()).filter(Boolean)
      : typeof topics === "string"
      ? topics.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    const parsedGalleryImages = Array.isArray(galleryImages)
      ? galleryImages.map((img: any, idx: number) => {
          if (typeof img === "string") {
            return {
              id: `gimg_${Date.now()}_${idx}`,
              url: img,
              caption: "",
              credit: "",
            };
          }
          return {
            id: img.id || `gimg_${Date.now()}_${idx}`,
            url: img.url,
            caption: img.caption || "",
            credit: img.credit || "",
          };
        })
      : [];

    const newEvent = await createGalleryEvent({
      title: title.trim(),
      slug: slug?.trim() || generateEventSlug(title),
      category: category.trim(),
      role: role.trim(),
      institution: institution.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      eventDate: eventDate?.trim() || null,
      location: location?.trim() || null,
      topics: parsedTopics,
      coverImage: coverImage.trim(),
      galleryImages: parsedGalleryImages,
      isFeatured: Boolean(isFeatured),
      status: status === "draft" ? "draft" : "published",
    });

    return NextResponse.json(
      { success: true, event: newEvent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin Gallery POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create gallery event." },
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required for update." },
        { status: 400 }
      );
    }

    const existing = await getGalleryEventById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    if (updates.topics) {
      updates.topics = Array.isArray(updates.topics)
        ? updates.topics.map((t: any) => String(t).trim()).filter(Boolean)
        : typeof updates.topics === "string"
        ? updates.topics.split(",").map((t: string) => t.trim()).filter(Boolean)
        : existing.topics;
    }

    if (updates.galleryImages) {
      updates.galleryImages = Array.isArray(updates.galleryImages)
        ? updates.galleryImages.map((img: any, idx: number) => {
            if (typeof img === "string") {
              return {
                id: `gimg_${Date.now()}_${idx}`,
                url: img,
                caption: "",
                credit: "",
              };
            }
            return {
              id: img.id || `gimg_${Date.now()}_${idx}`,
              url: img.url,
              caption: img.caption || "",
              credit: img.credit || "",
            };
          })
        : existing.galleryImages;
    }

    const updatedEvent = await updateGalleryEvent(id, updates);

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error: any) {
    console.error("Admin Gallery PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update gallery event." },
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
        { error: "Event ID is required." },
        { status: 400 }
      );
    }

    const success = await deleteGalleryEvent(id);
    if (!success) {
      return NextResponse.json(
        { error: "Event not found or could not be removed." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gallery event deleted successfully.",
    });
  } catch (error: any) {
    console.error("Admin Gallery DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete gallery event." },
      { status: 500 }
    );
  }
}
