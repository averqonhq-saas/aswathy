"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Video,
  MapPin,
  RefreshCw,
  Edit3,
  Check,
  Download,
} from "lucide-react";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import Drawer from "@/components/admin/Drawer";
import Modal from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { Booking } from "@/lib/db";

export default function BookingsManagementPage() {
  const { success, error, info } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Services list for dropdown filter
  const [servicesList, setServicesList] = useState<{ id: string; name: string }[]>([]);

  // Selected Booking Drawer
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Reschedule Modal
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // SSR hydration guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Services list for filter
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch("/api/admin/services");
        if (res.ok) {
          const data = await res.json();
          setServicesList(data.services || []);
        }
      } catch {
        // Fallback
      }
    }
    loadServices();
  }, []);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (serviceFilter !== "all") params.set("serviceId", serviceFilter);
      if (dateFilter) params.set("date", dateFilter);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      error("Failed to fetch bookings list.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, serviceFilter, dateFilter, searchQuery, page, error]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (selectedBooking) {
      setNotesInput(selectedBooking.internalNotes || "");
    }
  }, [selectedBooking]);

  const handleUpdateStatus = async (
    bookingId: string,
    status: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", status }),
      });
      const data = await res.json();
      if (res.ok) {
        success(`Booking ${status.toUpperCase()} successfully.`);
        setSelectedBooking(data.booking);
        fetchBookings();
      } else {
        error(data.error || "Update failed.");
      }
    } catch {
      error("Network error updating status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_notes", internalNotes: notesInput }),
      });
      const data = await res.json();
      if (res.ok) {
        success("Internal notes updated.");
        setSelectedBooking(data.booking);
        fetchBookings();
      } else {
        error("Failed to save notes.");
      }
    } catch {
      error("Network error saving notes.");
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !rescheduleDate || !rescheduleTime) return;

    setRescheduleLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          date: rescheduleDate,
          time: rescheduleTime,
          note: "Rescheduled by practitioner",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success(`Booking rescheduled to ${rescheduleDate} at ${rescheduleTime}.`);
        setSelectedBooking(data.booking);
        setRescheduleOpen(false);
        fetchBookings();
      } else {
        error(data.error || "Failed to reschedule.");
      }
    } catch {
      error("Network error during reschedule.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const columns: Column<Booking>[] = [
    {
      header: "Booking ID",
      accessor: (b) => (
        <span className="font-mono font-bold text-primary text-[11px]">{b.id}</span>
      ),
    },
    {
      header: "Client",
      accessor: (b) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-primary">{b.clientName}</div>
          <div className="text-[11px] text-on-surface-variant/80">{b.clientEmail}</div>
        </div>
      ),
    },
    {
      header: "Service",
      accessor: (b) => (
        <div className="space-y-0.5">
          <div className="font-medium text-primary line-clamp-1 max-w-[200px]">
            {b.serviceName}
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
            {b.format === "online" ? (
              <>
                <Video className="w-3 h-3 text-forest-green" />
                <span>Online Video</span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3 text-forest-green" />
                <span>Studio</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Date & Time",
      accessor: (b) => (
        <div className="space-y-0.5">
          <div className="font-medium text-primary">{b.appointmentDate}</div>
          <div className="text-[11px] text-forest-green font-mono font-semibold">
            {b.appointmentTime}
          </div>
        </div>
      ),
    },
    {
      header: "Source",
      accessor: (b) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
            b.provider === "zoho"
              ? "bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]"
              : "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
          }`}
        >
          {b.provider === "zoho" ? "Zoho Sync" : "Website"}
        </span>
      ),
    },
    {
      header: "Payment",
      accessor: (b) => <StatusBadge status={b.paymentStatus} size="sm" />,
    },
    {
      header: "Status",
      accessor: (b) => <StatusBadge status={b.bookingStatus} size="sm" />,
    },
    {
      header: "Actions",
      accessor: (b) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedBooking(b)}
            className="p-1.5 rounded-lg border border-surface-container hover:bg-surface hover:border-forest-green/40 text-on-surface-variant hover:text-forest-green transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {b.bookingStatus === "pending" && (
            <button
              onClick={() => handleUpdateStatus(b.id, "confirmed")}
              className="p-1.5 rounded-lg bg-[#E7F3EC] text-[#1B5E20] hover:bg-[#C8E6C9] transition-colors cursor-pointer"
              title="Confirm Booking"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!mounted) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container">
          <div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
              Consultation Bookings
            </h1>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
              Loading practice records...
            </p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-parchment-border/80 p-12 text-center text-xs text-on-surface-variant">
          Loading bookings data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
            Consultation Bookings
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
            Manage scheduled telehealth sessions ({total} total records).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBookings()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={bookings}
        keyExtractor={(b) => b.id}
        searchPlaceholder="Search client name, email, phone, ID..."
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(1);
        }}
        filterSlot={
          <>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-primary focus:outline-none focus:border-forest-green"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Service Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-primary focus:outline-none focus:border-forest-green max-w-[160px] truncate"
            >
              <option value="all">All Services</option>
              {servicesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-primary focus:outline-none focus:border-forest-green"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter("");
                  setPage(1);
                }}
                className="text-xs text-forest-green hover:underline cursor-pointer"
              >
                Clear Date
              </button>
            )}
          </>
        }
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="No bookings found"
        emptySubtitle="Try clearing your filters or search terms."
        onRowClick={(b) => setSelectedBooking(b)}
      />

      {/* Booking Side Drawer Inspection Modal */}
      <Drawer
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title="Consultation Details"
        subtitle={selectedBooking ? `Reference ID: ${selectedBooking.id}` : ""}
        footer={
          selectedBooking && (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {selectedBooking.bookingStatus === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 rounded-full bg-[#E7F3EC] text-[#1B5E20] hover:bg-[#C8E6C9] font-medium text-xs transition-colors cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                )}
                {selectedBooking.bookingStatus === "confirmed" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBooking.id, "completed")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 rounded-full bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#C2D7FF] font-medium text-xs transition-colors cursor-pointer"
                  >
                    Mark as Completed
                  </button>
                )}
                {selectedBooking.bookingStatus !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => {
                      setRescheduleDate(selectedBooking.appointmentDate);
                      setRescheduleTime(selectedBooking.appointmentTime);
                      setRescheduleOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full border border-surface-container bg-surface hover:bg-surface-container text-primary font-medium text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5 text-forest-green" />
                    <span>Reschedule</span>
                  </button>
                )}
                {selectedBooking.bookingStatus !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 rounded-full bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF] font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-1.5 rounded-full border border-surface-container text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )
        }
      >
        {selectedBooking && (
          <div className="space-y-6 text-xs">
            {/* Status & Service Banner */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-label-caps text-on-surface-variant block">
                  Therapeutic Specialization
                </span>
                <div className="font-semibold text-sm text-primary">
                  {selectedBooking.serviceName}
                </div>
              </div>
              <StatusBadge status={selectedBooking.bookingStatus} />
            </div>

            {/* Client Information */}
            <div className="space-y-2">
              <span className="font-label-caps text-[11px] uppercase tracking-wider text-forest-green font-semibold block">
                Client Contact Details
              </span>
              <div className="p-4 rounded-2xl bg-surface border border-surface-container space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Full Name:</span>
                  <span className="font-semibold text-primary">{selectedBooking.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Email Address:</span>
                  <a
                    href={`mailto:${selectedBooking.clientEmail}`}
                    className="text-forest-green hover:underline"
                  >
                    {selectedBooking.clientEmail}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Phone / WhatsApp:</span>
                  <a
                    href={`tel:${selectedBooking.clientPhone}`}
                    className="text-forest-green hover:underline"
                  >
                    {selectedBooking.clientPhone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Payment Status:</span>
                  <StatusBadge status={selectedBooking.paymentStatus} size="sm" />
                </div>
              </div>
            </div>

            {/* Session Logistics */}
            <div className="space-y-2">
              <span className="font-label-caps text-[11px] uppercase tracking-wider text-forest-green font-semibold block">
                Appointment Logistics
              </span>
              <div className="p-4 rounded-2xl bg-surface border border-surface-container space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Date &amp; Time:</span>
                  <span className="font-semibold text-primary">
                    {selectedBooking.appointmentDate} at {selectedBooking.appointmentTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Duration:</span>
                  <span>{selectedBooking.durationMinutes} Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Consultation Mode:</span>
                  <span className="capitalize font-medium text-primary flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-forest-green" />
                    <span>100% Online Telehealth</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Booking Channel:</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      selectedBooking.provider === "zoho"
                        ? "bg-[#FFF3E0] text-[#E65100]"
                        : "bg-[#E8F5E9] text-[#2E7D32]"
                    }`}
                  >
                    {selectedBooking.provider === "zoho" ? "Zoho Bookings Sync" : "Website Direct Intake"}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Intake Notes */}
            {selectedBooking.clientMessage && (
              <div className="space-y-1">
                <span className="font-label-caps text-[11px] uppercase tracking-wider text-forest-green font-semibold block">
                  Client Intake Statement
                </span>
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container italic text-on-surface-variant leading-relaxed">
                  &ldquo;{selectedBooking.clientMessage}&rdquo;
                </div>
              </div>
            )}

            {/* Internal Practitioner Notes */}
            <div className="space-y-2">
              <span className="font-label-caps text-[11px] uppercase tracking-wider text-forest-green font-semibold block">
                Internal Clinical Notes (Practitioner Eyes Only)
              </span>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Add clinical observations, grounding homework, or discussion themes..."
                className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container text-xs text-primary focus:outline-none focus:border-forest-green focus:bg-surface resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-3.5 py-1.5 rounded-full bg-forest-green text-white hover:bg-forest-green-hover text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Save Notes
              </button>
            </div>

            {/* History Audit Trail */}
            <div className="space-y-2 pt-2 border-t border-surface-container">
              <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant/70 font-semibold block">
                Booking History Log
              </span>
              <div className="space-y-2">
                {selectedBooking.history.map((h, idx) => (
                  <div key={idx} className="text-[11px] text-on-surface-variant flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-green shrink-0 mt-1" />
                    <div>
                      <span className="font-medium text-primary">{h.action}</span>
                      {h.note && (
                        <span className="italic text-on-surface-variant/70 block">
                          &ldquo;{h.note}&rdquo;
                        </span>
                      )}
                      <span className="text-on-surface-variant/60 block text-[10px]">
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule Appointment"
        subtitle={selectedBooking ? `Client: ${selectedBooking.clientName}` : ""}
        maxWidth="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRescheduleOpen(false)}
              className="px-4 py-2 rounded-full border border-surface-container-high text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRescheduleSubmit}
              disabled={rescheduleLoading}
              className="px-5 py-2 rounded-full bg-forest-green text-white text-xs font-semibold hover:bg-forest-green-hover shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {rescheduleLoading ? "Saving..." : "Confirm New Time"}
            </button>
          </>
        }
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4 py-1">
          <div className="space-y-1">
            <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
              New Appointment Date
            </label>
            <input
              type="date"
              required
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-primary focus:outline-none focus:border-forest-green focus:bg-surface"
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
              New Appointment Time Slot
            </label>
            <select
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-primary focus:outline-none focus:border-forest-green focus:bg-surface"
            >
              {[
                "10:00 AM",
                "11:30 AM",
                "02:00 PM",
                "03:30 PM",
                "05:00 PM",
                "06:30 PM",
                "07:30 PM",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
