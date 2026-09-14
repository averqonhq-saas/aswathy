import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Only return active, non-deleted services sorted by order
    const activeServices = (db.services || [])
      .filter((s) => s.status === "active" && !s.deletedAt)
      .sort((a, b) => a.order - b.order);

    return NextResponse.json(
      {
        success: true,
        services: activeServices,
        categories: db.serviceCategories || [],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Public services GET error:", error);
    return NextResponse.json(
      { error: "Failed to load services" },
      { status: 500 }
    );
  }
}
