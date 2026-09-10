import { Booking } from "../db";

export interface CreateBookingDTO {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "11:30 AM"
  format: "online" | "in-person";
  clientMessage?: string;
}

export interface BookingFilterOptions {
  status?: string;
  date?: string;
  serviceId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookingProvider {
  name: "internal";
  listBookings(options?: BookingFilterOptions): Promise<{
    bookings: Booking[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getBooking(id: string): Promise<Booking | null>;
  createBooking(dto: CreateBookingDTO): Promise<Booking>;
  updateBookingStatus(
    id: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
    note?: string
  ): Promise<Booking | null>;
  updatePaymentStatus(
    id: string,
    paymentStatus: "pending" | "paid" | "refunded",
    note?: string
  ): Promise<Booking | null>;
  updateBookingNotes(id: string, internalNotes: string): Promise<Booking | null>;
  rescheduleBooking(
    id: string,
    date: string,
    time: string,
    note?: string
  ): Promise<Booking | null>;
  cancelBooking(id: string, reason?: string): Promise<Booking | null>;
}
