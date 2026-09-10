import { getDatabase, saveDatabase, Booking } from "../db";
import { BookingProvider, BookingFilterOptions, CreateBookingDTO } from "./types";
import { getPgPool } from "../supabase-db";

/**
 * Maps a Supabase `bookings` SQL row → the app's Booking interface.
 * This reads bookings stored in the relational SQL table.
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
        action: `Booking synced from database (Ref: ${row.id})`,
      },
    ],
    provider: "internal",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    deletedAt: row.deleted_at || null,
  };
}

/**
 * Fetches all bookings from the relational `bookings` SQL table in Supabase.
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

    // Pull bookings from the relational SQL table
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

    // Fall back to SQL table for bookings not synced to JSONB
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

  private async findOrLoadBooking(
    id: string,
    db: any
  ): Promise<{ booking: Booking; index: number } | null> {
    const cleanId = id.trim();
    const index = db.bookings.findIndex(
      (b: Booking) =>
        (b.id === cleanId || b.id.toLowerCase() === cleanId.toLowerCase()) && !b.deletedAt
    );

    if (index !== -1) {
      return { booking: db.bookings[index], index };
    }

    // Check PostgreSQL relational table
    try {
      const pool = getPgPool();
      const res = await pool.query(
        `SELECT * FROM bookings WHERE (id = $1 OR LOWER(id) = LOWER($1)) AND deleted_at IS NULL LIMIT 1`,
        [cleanId]
      );
      if (res.rows.length > 0) {
        const loaded = sqlRowToBooking(res.rows[0]);
        db.bookings.unshift(loaded);
        return { booking: loaded, index: 0 };
      }
    } catch (sqlErr) {
      console.warn("[InternalProvider] SQL lookup error:", sqlErr);
    }

    return null;
  }

  async updateBookingStatus(
    id: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
    note?: string
  ): Promise<Booking | null> {
    const db = await getDatabase();
    const found = await this.findOrLoadBooking(id, db);
    if (!found) return null;

    const booking = found.booking;
    const now = new Date().toISOString();

    booking.bookingStatus = status;
    booking.updatedAt = now;

    booking.history.unshift({
      timestamp: now,
      action: `Status updated to ${status.toUpperCase()}`,
      note: note || undefined,
    });

    // Update relational PostgreSQL table
    try {
      const pool = getPgPool();
      await pool.query(
        `UPDATE bookings SET status = $1, updated_at = $2 WHERE id = $3 OR LOWER(id) = LOWER($3)`,
        [status, now, booking.id]
      );
    } catch (sqlErr) {
      console.warn("[InternalProvider] SQL booking status update error:", sqlErr);
    }

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

  async updatePaymentStatus(
    id: string,
    paymentStatus: "pending" | "paid" | "refunded",
    note?: string
  ): Promise<Booking | null> {
    const db = await getDatabase();
    const found = await this.findOrLoadBooking(id, db);
    if (!found) return null;

    const booking = found.booking;
    const now = new Date().toISOString();
    const prevPaymentStatus = booking.paymentStatus || "pending";

    booking.paymentStatus = paymentStatus;
    booking.updatedAt = now;

    if (!booking.history) booking.history = [];
    booking.history.unshift({
      timestamp: now,
      action: `Payment status manually updated from ${prevPaymentStatus.toUpperCase()} to ${paymentStatus.toUpperCase()}${note ? ` (${note})` : ""}`,
      note: note || undefined,
    });

    // Update relational PostgreSQL table
    try {
      const pool = getPgPool();
      await pool.query(
        `UPDATE bookings SET payment_status = $1, updated_at = $2 WHERE id = $3 OR LOWER(id) = LOWER($3)`,
        [paymentStatus, now, booking.id]
      );
    } catch (sqlErr) {
      console.warn("[InternalProvider] SQL payment status update error:", sqlErr);
    }

    // Notify practice admin of manual payment update
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: "status_change",
      title: `Payment ${paymentStatus.toUpperCase()}`,
      message: `Payment status for ${booking.clientName} (#${booking.id}) manually marked as ${paymentStatus.toUpperCase()}${note ? ` (${note})` : ""}.`,
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
    const found = await this.findOrLoadBooking(id, db);
    if (!found) return null;

    const booking = found.booking;
    const now = new Date().toISOString();
    booking.internalNotes = internalNotes;
    booking.updatedAt = now;

    try {
      const pool = getPgPool();
      await pool.query(
        `UPDATE bookings SET internal_notes = $1, updated_at = $2 WHERE id = $3 OR LOWER(id) = LOWER($3)`,
        [internalNotes, now, booking.id]
      );
    } catch (sqlErr) {
      console.warn("[InternalProvider] SQL notes update error:", sqlErr);
    }

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
    const found = await this.findOrLoadBooking(id, db);
    if (!found) return null;

    const booking = found.booking;
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

    try {
      const pool = getPgPool();
      await pool.query(
        `UPDATE bookings SET appointment_date = $1, appointment_time = $2, updated_at = $3 WHERE id = $4 OR LOWER(id) = LOWER($4)`,
        [date, time, now, booking.id]
      );
    } catch (sqlErr) {
      console.warn("[InternalProvider] SQL reschedule update error:", sqlErr);
    }

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
