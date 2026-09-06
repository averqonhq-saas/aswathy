import { getDatabase, saveDatabase, Booking } from "../db";
import { BookingProvider, BookingFilterOptions, CreateBookingDTO } from "./types";
import { getPgPool } from "../supabase-db";

/**
 * Maps a Supabase `bookings` SQL row → the app's Booking interface.
 * This is how Zoho/Zapier bookings (stored in the relational table) become
 * visible in the admin dashboard.
 */
function sqlRowToBooking(row: Record<string, any>): Booking {
  return {
    id: row.id,
    clientName: row.client_name || "Unknown",
    clientEmail: row.client_email || "",
    clientPhone: row.client_phone || "",
    serviceId: row.service_id || "serv_1",
    serviceName: row.service_name || "Consultation",
    appointmentDate: row.appointment_date
      ? new Date(row.appointment_date).toISOString().split("T")[0]
      : "",
    appointmentTime: row.appointment_time || "",
    durationMinutes: row.duration_minutes || 50,
    format: (row.meeting_format as "online" | "in-person") || "online",
    bookingStatus: (row.status as Booking["bookingStatus"]) || "confirmed",
    paymentStatus: (row.payment_status as Booking["paymentStatus"]) || "paid",
    price: row.price || undefined,
    meetingLink: row.meeting_link || undefined,
    clientMessage: row.client_notes || "",
    internalNotes: row.internal_notes || undefined,
    history: [
      {
        timestamp: row.created_at || new Date().toISOString(),
        action: `Booking synced from Zoho Bookings (Ref: ${row.zoho_booking_id || row.id})`,
      },
    ],
    provider: "zoho",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    deletedAt: row.deleted_at || null,
  };
}

/**
 * Fetches all bookings from the relational `bookings` SQL table in Supabase.
 * These are written when Zoho/Zapier posts to /api/integrations/zoho/bookings.
 */
async function fetchSqlBookings(): Promise<Booking[]> {
  try {
    const pool = getPgPool();
    const res = await pool.query(
      `SELECT * FROM bookings WHERE deleted_at IS NULL ORDER BY appointment_date DESC, appointment_time DESC`
    );
    return res.rows.map(sqlRowToBooking);
  } catch (err) {
    // Non-fatal — fall back to JSONB source only
    console.warn("[InternalProvider] Could not fetch relational bookings table:", err);
    return [];
  }
}

export class InternalBookingProvider implements BookingProvider {
  name: "internal" = "internal";

  async listBookings(options: BookingFilterOptions = {}): Promise<{
    bookings: Booking[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const db = await getDatabase();
    const jsonbBookings = db.bookings.filter((b) => !b.deletedAt);

    // Pull bookings that came from Zoho/Zapier via the relational SQL table
    const sqlBookings = await fetchSqlBookings();

    // Merge: SQL bookings take precedence over JSONB for the same ID
    const merged = new Map<string, Booking>();
    for (const b of jsonbBookings) merged.set(b.id, b);
    for (const b of sqlBookings) {
      // Only add SQL booking if not already present in JSONB (avoid double-counting)
      if (!merged.has(b.id)) merged.set(b.id, b);
    }

    let results = Array.from(merged.values());

    // Filter by status
    if (options.status && options.status !== "all") {
      results = results.filter(
        (b) => b.bookingStatus.toLowerCase() === options.status?.toLowerCase()
      );
    }

    // Filter by service
    if (options.serviceId && options.serviceId !== "all") {
      results = results.filter((b) => b.serviceId === options.serviceId);
    }

    // Filter by date
    if (options.date) {
      results = results.filter((b) => b.appointmentDate === options.date);
    }

    // Search query
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      results = results.filter(
        (b) =>
          b.clientName.toLowerCase().includes(q) ||
          b.clientEmail.toLowerCase().includes(q) ||
          b.clientPhone.includes(q) ||
          b.id.toLowerCase().includes(q)
      );
    }

    // Sort by date and time descending (newest first)
    results.sort((a, b) => {
      const dateA = `${a.appointmentDate} ${a.appointmentTime}`;
      const dateB = `${b.appointmentDate} ${b.appointmentTime}`;
      return dateB.localeCompare(dateA);
    });

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const total = results.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = results.slice((page - 1) * limit, page * limit);

    return {
      bookings: paginated,
      total,
      page,
      totalPages,
    };
  }


  async getBooking(id: string): Promise<Booking | null> {
    const db = await getDatabase();
    const found = db.bookings.find((b) => b.id === id && !b.deletedAt);
    if (found) return found;

    // Fall back to SQL table for Zoho bookings not synced to JSONB
    try {
      const pool = getPgPool();
      const res = await pool.query(
        `SELECT * FROM bookings WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [id]
      );
      if (res.rows.length > 0) return sqlRowToBooking(res.rows[0]);
    } catch {
      // Ignore — return null
    }
    return null;

  }

  async createBooking(dto: CreateBookingDTO): Promise<Booking> {
    const db = await getDatabase();
    const service = db.services.find((s) => s.id === dto.serviceId);
    const now = new Date().toISOString();

    const newBooking: Booking = {
      id: `BK-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      clientName: dto.clientName,
      clientEmail: dto.clientEmail,
      clientPhone: dto.clientPhone,
      serviceId: dto.serviceId,
      serviceName: service ? service.name : "Individual Consultation",
      appointmentDate: dto.appointmentDate,
      appointmentTime: dto.appointmentTime,
      durationMinutes: service ? service.durationMinutes : 50,
      format: dto.format,
      bookingStatus: "pending",
      paymentStatus: "pending",
      clientMessage: dto.clientMessage,
      history: [
        {
          timestamp: now,
          action: "Booking submitted by client",
        },
      ],
      provider: "internal",
      createdAt: now,
      updatedAt: now,
    };

    db.bookings.unshift(newBooking);

    // Also push a notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "booking_new",
      title: "New Booking Scheduled",
      message: `${newBooking.clientName} booked for ${newBooking.appointmentDate} at ${newBooking.appointmentTime}.`,
      link: "/admin/bookings",
      isRead: false,
      createdAt: now,
    });

    await saveDatabase(db);
    return newBooking;
  }

  async updateBookingStatus(
    id: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
    note?: string
  ): Promise<Booking | null> {
    const db = await getDatabase();
    const index = db.bookings.findIndex((b) => b.id === id && !b.deletedAt);
    if (index === -1) return null;

    const booking = db.bookings[index];
    const now = new Date().toISOString();

    booking.bookingStatus = status;
    booking.updatedAt = now;

    if (status === "confirmed") {
      booking.paymentStatus = "paid";
    }

    booking.history.unshift({
      timestamp: now,
      action: `Status updated to ${status.toUpperCase()}`,
      note: note || undefined,
    });

    // Notify if status changed
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: status === "cancelled" ? "booking_cancel" : "status_change",
      title: `Booking ${status.toUpperCase()}`,
      message: `Booking ${booking.id} (${booking.clientName}) marked as ${status}.`,
      link: "/admin/bookings",
      isRead: false,
      createdAt: now,
    });

    await saveDatabase(db);
    return booking;
  }

  async updateBookingNotes(
    id: string,
    internalNotes: string
  ): Promise<Booking | null> {
    const db = await getDatabase();
    const booking = db.bookings.find((b) => b.id === id && !b.deletedAt);
    if (!booking) return null;

    booking.internalNotes = internalNotes;
    booking.updatedAt = new Date().toISOString();
    await saveDatabase(db);
    return booking;
  }

  async rescheduleBooking(
    id: string,
    date: string,
    time: string,
    note?: string
  ): Promise<Booking | null> {
    const db = await getDatabase();
    const booking = db.bookings.find((b) => b.id === id && !b.deletedAt);
    if (!booking) return null;

    const now = new Date().toISOString();
    const prevDate = booking.appointmentDate;
    const prevTime = booking.appointmentTime;

    booking.appointmentDate = date;
    booking.appointmentTime = time;
    booking.updatedAt = now;

    booking.history.unshift({
      timestamp: now,
      action: `Rescheduled from ${prevDate} ${prevTime} to ${date} ${time}`,
      note: note || undefined,
    });

    // Push notification for reschedule
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "booking_rescheduled",
      title: "Booking Rescheduled",
      message: `${booking.clientName}'s appointment rescheduled to ${date} at ${time}.`,
      link: "/admin/bookings",
      isRead: false,
      createdAt: now,
    });

    await saveDatabase(db);
    return booking;
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking | null> {
    return this.updateBookingStatus(id, "cancelled", reason);
  }
}
