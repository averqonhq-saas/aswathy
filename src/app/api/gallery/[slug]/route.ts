import { NextResponse } from "next/server";
import { getGalleryEventBySlug } from "@/lib/db";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteParams) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const event = await getGalleryEventBySlug(slug);

    if (!event || event.status !== "published") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(
      { event },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Gallery Single GET error:", error);
    return NextResponse.json(
      { error: "Failed to load event" },
      { status: 500 }
    );
  }
}
