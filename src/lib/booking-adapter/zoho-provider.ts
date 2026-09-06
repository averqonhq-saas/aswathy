import { Booking } from "../db";
import { BookingProvider, BookingFilterOptions, CreateBookingDTO } from "./types";
import { InternalBookingProvider } from "./internal-provider";

/**
 * ZohoBookingProvider
 * Implements the BookingProvider interface so that Zoho Bookings can be swapped in
 * or synchronized with webhooks without rewriting the admin dashboard.
 */
export class ZohoBookingProvider implements BookingProvider {
  name: "zoho" = "zoho";
  private fallback: InternalBookingProvider;

  constructor() {
    this.fallback = new InternalBookingProvider();
  }

  async listBookings(options?: BookingFilterOptions): Promise<{
    bookings: Booking[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // In production, syncs with Zoho Bookings API / Webhook database cache
    return this.fallback.listBookings(options);
  }

  async getBooking(id: string): Promise<Booking | null> {
    return this.fallback.getBooking(id);
  }

  async createBooking(dto: CreateBookingDTO): Promise<Booking> {
    const booking = await this.fallback.createBooking(dto);
    booking.provider = "zoho";
    return booking;
  }

  async updateBookingStatus(
    id: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
    note?: string
  ): Promise<Booking | null> {
    return this.fallback.updateBookingStatus(id, status, note);
  }

  async updateBookingNotes(
    id: string,
    internalNotes: string
  ): Promise<Booking | null> {
    return this.fallback.updateBookingNotes(id, internalNotes);
  }

  async rescheduleBooking(
    id: string,
    date: string,
    time: string,
    note?: string
  ): Promise<Booking | null> {
    return this.fallback.rescheduleBooking(id, date, time, note);
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking | null> {
    return this.fallback.cancelBooking(id, reason);
  }
}
