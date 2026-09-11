import { NextResponse } from "next/server";
import { getDatabase, getBookedSlots } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDatabase();
    const bookedSlots = await getBookedSlots();

    return NextResponse.json({
      success: true,
      about: db.websiteAbout,
      journey: [...(db.journeyEntries || [])].sort((a, b) => a.order - b.order),
      sessionSteps: [...(db.sessionSteps || [])].sort((a, b) => a.order - b.order),
      sessionFormats: [...(db.sessionFormats || [])]
        .filter((f) => f.isActive !== false)
        .sort((a, b) => a.order - b.order),
      clientTypes: (db.clientTypes || [])
        .filter((ct) => ct.isActive)
        .sort((a, b) => a.order - b.order),
      testimonials: (db.feedback || [])
        .filter((fb) => fb.status === "approved" && fb.publicVisibility)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      settings: db.settings,
      bookingFormConfig: db.bookingFormConfig,
      blockedSlots: db.blockedSlots || [],
      bookedSlots,
    });
  } catch (error) {
    console.error("Public content GET error:", error);
    return NextResponse.json(
      { error: "Failed to load website content" },
      { status: 500 }
    );
  }
}
