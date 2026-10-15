import { NextResponse } from "next/server";
import { getGalleryEvents } from "@/lib/db";
import { GALLERY_CATEGORIES } from "@/lib/gallery-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") as "newest" | "oldest") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    // Only published events for public endpoint
    const allPublishedEvents = await getGalleryEvents({
      status: "published",
      category,
      search,
      sortBy,
    });

    const totalCount = allPublishedEvents.length;
    const startIndex = (page - 1) * limit;
    const paginatedEvents = allPublishedEvents.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        events: paginatedEvents,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        categories: GALLERY_CATEGORIES,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Public Gallery GET error:", error);
    return NextResponse.json(
      { error: "Failed to load gallery events" },
      { status: 500 }
    );
  }
}
