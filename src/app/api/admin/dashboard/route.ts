import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const today = new Date().toISOString().split("T")[0];

    const activeBookings = db.bookings.filter((b) => !b.deletedAt);

    // Today's appointments
    const todayAppointments = activeBookings
      .filter((b) => b.appointmentDate === today)
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

    const todaySessionsCount = todayAppointments.filter(
      (b) => b.bookingStatus !== "cancelled"
    ).length;

    // Upcoming bookings (today or future, pending or confirmed)
    const upcomingBookingsCount = activeBookings.filter(
      (b) =>
        b.appointmentDate >= today &&
        (b.bookingStatus === "confirmed" || b.bookingStatus === "pending")
    ).length;

    // Pending enquiries
    const pendingEnquiriesCount = db.enquiries.filter(
      (e) => !e.deletedAt && e.status === "new"
    ).length;

    // Active services
    const totalServicesCount = db.services.filter(
      (s) => !s.deletedAt && s.status === "active"
    ).length;

    // Recent enquiries (latest 5)
    const recentEnquiries = [...db.enquiries]
      .filter((e) => !e.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);

    // Analytics summary
    const completedCount = activeBookings.filter(
      (b) => b.bookingStatus === "completed"
    ).length;
    const confirmedCount = activeBookings.filter(
      (b) => b.bookingStatus === "confirmed"
    ).length;
    const pendingCount = activeBookings.filter(
      (b) => b.bookingStatus === "pending"
    ).length;
    const cancelledCount = activeBookings.filter(
      (b) => b.bookingStatus === "cancelled"
    ).length;

    // 7 Days overview breakdown
    const dayBuckets: { [date: string]: { completed: number; confirmed: number; pending: number; cancelled: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      dayBuckets[iso] = { completed: 0, confirmed: 0, pending: 0, cancelled: 0 };
    }

    activeBookings.forEach((b) => {
      if (dayBuckets[b.appointmentDate]) {
        if (b.bookingStatus === "completed") dayBuckets[b.appointmentDate].completed++;
        else if (b.bookingStatus === "confirmed") dayBuckets[b.appointmentDate].confirmed++;
        else if (b.bookingStatus === "pending") dayBuckets[b.appointmentDate].pending++;
        else if (b.bookingStatus === "cancelled") dayBuckets[b.appointmentDate].cancelled++;
      }
    });

    const chartData = Object.keys(dayBuckets).map((date) => {
      const d = new Date(date);
      return {
        date,
        label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
        ...dayBuckets[date],
        total:
          dayBuckets[date].completed +
          dayBuckets[date].confirmed +
          dayBuckets[date].pending +
          dayBuckets[date].cancelled,
      };
    });

    return NextResponse.json({
      metrics: {
        todaySessionsCount,
        upcomingBookingsCount,
        pendingEnquiriesCount,
        totalServicesCount,
      },
      todayAppointments,
      recentEnquiries,
      analytics: {
        total: activeBookings.length,
        completed: completedCount,
        confirmed: confirmedCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        chartData,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}
