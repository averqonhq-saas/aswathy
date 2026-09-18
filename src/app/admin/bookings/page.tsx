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
  Trash2,
  CreditCard,
  RotateCcw,
  Mail,
} from "lucide-react";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import Drawer from "@/components/admin/Drawer";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import type { Booking } from "@/lib/types";

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

  // Delete Booking confirmation states
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Google Calendar Integration Status
  const [googleStatus, setGoogleStatus] = useState<{
    configured: boolean;
    connected: boolean;
    needsReauth?: boolean;
    statusMessage?: string;
    authUrl: string | null;
    calendarAccount?: string;
  } | null>(null);
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);

  const handleDeleteBooking = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        success("Booking removed successfully.");
        if (selectedBooking?.id === id) {
          setSelectedBooking(null);
        }
        setDeletingBooking(null);
        fetchBookings();
      } else {
        error(data.error || "Failed to delete booking.");
      }
    } catch {
      error("Network error deleting booking.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllBookings = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/bookings", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        success("All booking records cleared.");
        setSelectedBooking(null);
        setClearAllConfirmOpen(false);
        fetchBookings();
      } else {
        error(data.error || "Failed to clear bookings.");
      }
    } catch {
      error("Network error clearing bookings.");
    } finally {
      setIsDeleting(false);
    }
  };

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

  const fetchGoogleStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/google-calendar");
      if (res.ok) {
        const data = await res.json();
        setGoogleStatus(data);
      }
    } catch {
      // Non-fatal
    }
  }, []);

  useEffect(() => {
    fetchGoogleStatus();
  }, [fetchGoogleStatus]);

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

  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);
  const [sendPaymentEmail, setSendPaymentEmail] = useState(true);

  const handleUpdatePaymentStatus = async (
    bookingId: string,
    paymentStatus: "pending" | "paid" | "refunded",
    note?: string,
    sendEmail: boolean = true
  ) => {
    setIsUpdatingPayment(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_payment_status",
          paymentStatus,
          note,
          sendEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success(
          `Payment marked as ${paymentStatus.toUpperCase()}${
            sendEmail ? " & receipt emailed to client" : ""
          }!`
        );
        setSelectedBooking(data.booking);
        fetchBookings();
      } else {
        error(data.error || "Failed to update payment status.");
      }
    } catch {
      error("Network error updating payment status.");
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleSendPaymentReceipt = async (bookingId: string) => {
    setIsSendingReceipt(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_payment_receipt",
          sendEmail: true,
          note: "Official payment receipt sent by practitioner",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success("Payment receipt emailed to client successfully! ✉️");
        setSelectedBooking(data.booking);
        fetchBookings();
      } else {
        error(data.error || "Failed to send payment receipt.");
      }
    } catch {
      error("Network error sending payment receipt.");
    } finally {
      setIsSendingReceipt(false);
    }
  };

  const handleGenerateMeet = async (id: string) => {
    setIsGeneratingMeet(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_meet" }),
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        success("Official Google Calendar event created & Google Meet link generated!");
        setSelectedBooking(data.booking);
        fetchBookings();
        fetchGoogleStatus();
      } else {
        if (data.needsAuth) {
          error(
            "Google Calendar token expired. Please click 'Connect Google Calendar' in the header to re-authorize."
          );
          fetchGoogleStatus();
        } else {
          error(data.error || "Failed to generate Google Meet link. Please connect Google Calendar.");
        }
      }
    } catch {
      error("Network error generating Google Meet link.");
    } finally {
      setIsGeneratingMeet(false);
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
      className: "whitespace-nowrap",
      accessor: (b) => (
        <span className="font-sans font-semibold text-[#1A3828] text-xs tracking-wide bg-[#1A3828]/5 px-2 py-0.5 rounded-md border border-[#1A3828]/10 whitespace-nowrap">
          {b.id}
        </span>
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
          <div className="text-[11px] text-on-surface-variant flex items-center gap-1 flex-wrap">
            {b.format === "online" ? (
              <>
                <Video className="w-3 h-3 text-forest-green" />
                <span>Online Video</span>
                {b.meetingLink && b.meetingLink.startsWith("http") && (
                  <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                    Meet ✓
                  </span>
                )}
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
      className: "whitespace-nowrap min-w-[130px]",
      accessor: (b) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <div className="font-medium text-primary text-xs whitespace-nowrap">{b.appointmentDate}</div>
          <div className="text-xs text-forest-green font-semibold whitespace-nowrap flex items-center gap-1">
            <Clock className="w-3 h-3 text-forest-green/70" />
            <span>{b.appointmentTime}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Source",
      accessor: () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
          Website
        </span>
      ),
    },
    {
      header: "Payment",
      className: "min-w-[175px]",
      accessor: (b) => (
        <div className="inline-flex items-center gap-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <StatusBadge status={b.paymentStatus || "pending"} size="sm" />
          {b.paymentStatus !== "paid" && (
            <button
              onClick={() => handleUpdatePaymentStatus(b.id, "paid", "Quick manual settlement")}
              disabled={isUpdatingPayment}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E7F3EC] hover:bg-[#C8E6C9] border border-[#A5D6A7] text-[#1B5E20] text-[10px] font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95 disabled:opacity-50"
              title="Click to mark as paid manually (Cash / UPI)"
            >
              <Check className="w-3 h-3 text-[#1B5E20]" />
              <span>Mark Paid</span>
            </button>
          )}
        </div>
      ),
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
          <button
            onClick={() => setDeletingBooking(b)}
            className="p-1.5 rounded-lg border border-surface-container hover:bg-[#FCE8E6] hover:border-[#FAD2CF] text-on-surface-variant hover:text-[#C5221F] transition-colors cursor-pointer"
            title="Delete Booking"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Google Calendar Connection Status Pill */}
          {googleStatus?.connected ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 font-medium"
              title="Google Calendar & Google Meet API connected and active"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              <span>Calendar &amp; Meet Active</span>
            </div>
          ) : (
            <a
              href="/api/auth/google/login"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs ${
                googleStatus?.needsReauth
                  ? "border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 animate-pulse"
                  : "border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900"
              }`}
              title={
                googleStatus?.needsReauth
                  ? "Google Calendar token has expired. Click to re-authorize with roottherapyonline@gmail.com"
                  : "Click once to authorize Google Calendar for roottherapyonline@gmail.com"
              }
            >
              <Calendar className="w-3.5 h-3.5 text-current" />
              <span>
                {googleStatus?.needsReauth
                  ? "⚠️ Reconnect Google Calendar"
                  : "Connect Google Calendar"}
              </span>
            </a>
          )}

          {total > 0 && (
            <button
              onClick={() => setClearAllConfirmOpen(true)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#FAD2CF] bg-[#FCE8E6] hover:bg-[#FAD2CF] text-xs font-medium text-[#C5221F] transition-colors cursor-pointer disabled:opacity-50"
              title="Clear all booking records"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#C5221F]" />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={() => {
              fetchBookings();
              fetchGoogleStatus();
            }}
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
        width="xl"
        footer={
          selectedBooking && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2.5">
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
                <button
                  type="button"
                  onClick={() => setDeletingBooking(selectedBooking)}
                  disabled={isUpdatingStatus || isDeleting}
                  className="px-3.5 py-1.5 rounded-full border border-[#FAD2CF] bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF] font-medium text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-1.5 rounded-full border border-surface-container text-xs text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
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
              </div>
            </div>

            {/* Payment Status & Manual Settlement Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-[11px] uppercase tracking-wider text-forest-green font-semibold block">
                  Payment Status &amp; Manual Settlement
                </span>
                <span className="text-[11px] font-semibold text-primary">
                  Fee: ₹{(selectedBooking.price || 1800).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-surface-container space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-on-surface-variant block mb-1">Status</span>
                    <StatusBadge status={selectedBooking.paymentStatus || "pending"} size="sm" />
                  </div>

                  {/* Manual payment controls */}
                  <div className="flex items-center gap-2">
                    {selectedBooking.paymentStatus !== "paid" ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdatePaymentStatus(
                            selectedBooking.id,
                            "paid",
                            "Marked as paid manually (Cash / UPI / Reception)",
                            sendPaymentEmail
                          )
                        }
                        disabled={isUpdatingPayment}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Mark payment as received via Cash, UPI, or clinic reception"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Paid</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdatePaymentStatus(
                            selectedBooking.id,
                            "pending",
                            "Reverted to pending manually",
                            sendPaymentEmail
                          )
                        }
                        disabled={isUpdatingPayment}
                        className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Revert status to pending settlement"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Mark Pending</span>
                      </button>
                    )}

                    <select
                      value={selectedBooking.paymentStatus || "pending"}
                      onChange={(e) =>
                        handleUpdatePaymentStatus(
                          selectedBooking.id,
                          e.target.value as "pending" | "paid" | "refunded",
                          undefined,
                          sendPaymentEmail
                        )
                      }
                      disabled={isUpdatingPayment}
                      className="text-xs py-1.5 px-2.5 rounded-lg border border-surface-container bg-surface-container-low text-primary cursor-pointer focus:outline-none focus:border-forest-green"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Email Option Checkbox & Send Receipt Button */}
                <div className="pt-2.5 border-t border-surface-container/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <label className="flex items-center gap-2 text-xs text-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendPaymentEmail}
                      onChange={(e) => setSendPaymentEmail(e.target.checked)}
                      className="rounded border-surface-container-high text-forest-green focus:ring-forest-green cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-medium">
                      <Mail className="w-3.5 h-3.5 text-forest-green" />
                      <span>Send receipt email to client ({selectedBooking.clientEmail})</span>
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleSendPaymentReceipt(selectedBooking.id)}
                    disabled={isSendingReceipt || isUpdatingPayment}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-forest-green/30 bg-surface hover:bg-forest-green/10 text-forest-green text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
                    title="Send or re-send payment receipt email to client"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isSendingReceipt ? "Sending Receipt..." : "Send Paid Receipt in Mail"}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant flex items-start gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-forest-green shrink-0 mt-0.5" />
                  <span>
                    When online payment is disabled, use these controls to manually record payments settled via Cash, Clinic POS, direct UPI, or bank transfer.
                  </span>
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
                    <span>{selectedBooking.format === "in-person" ? "In-Person Clinic" : "100% Online Telehealth"}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Booking Channel:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                    Website Direct Intake
                  </span>
                </div>
              </div>
            </div>

            {/* Google Calendar & Meet Integration Card */}
            <div className="space-y-2">
              <span className="font-label-caps text-[11px] uppercase tracking-wider text-forest-green font-semibold block">
                Google Calendar &amp; Video Consultation
              </span>
              <div className="p-4 rounded-2xl bg-surface border border-surface-container space-y-3">
                {selectedBooking.meetingLink && selectedBooking.meetingLink.startsWith("http") ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {selectedBooking.paymentStatus === "paid" ? (
                          <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Google Meet Active (Payment Verified)
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              Payment Pending • Link Withheld From Client
                            </span>
                            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1">
                              📌 Meeting details will be shared after payment confirmation.
                            </p>
                          </div>
                        )}
                        <a
                          href={selectedBooking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary font-mono hover:underline break-all mt-1 block"
                        >
                          {selectedBooking.meetingLink}
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-container">
                      <a
                        href={selectedBooking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Google Meet</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleGenerateMeet(selectedBooking.id)}
                        disabled={isGeneratingMeet}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-container bg-surface-container-low hover:bg-surface-container text-xs text-primary transition-all cursor-pointer disabled:opacity-50"
                        title="Re-generate Google Meet room and send updated invite"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMeet ? "animate-spin" : ""}`} />
                        <span>{isGeneratingMeet ? "Syncing..." : "Re-sync Calendar & Meet"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedBooking.paymentStatus !== "paid" ? (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-amber-800">
                          <span>⏳</span>
                          <span>Payment Pending</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-800/90">
                          Meeting details will be shared after payment confirmation. Google Meet will be generated and dispatched automatically when payment is verified (or when you click <strong>Mark as Paid</strong>).
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant">
                        No Google Meet link has been generated for this booking yet.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleGenerateMeet(selectedBooking.id)}
                      disabled={isGeneratingMeet}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest-green hover:bg-forest-green/90 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{isGeneratingMeet ? "Creating Google Meet..." : "Generate Google Meet & Calendar Invite"}</span>
                    </button>
                  </div>
                )}
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

      {/* Confirm Delete Single Booking */}
      <ConfirmDialog
        isOpen={!!deletingBooking}
        onClose={() => setDeletingBooking(null)}
        onConfirm={() => {
          if (deletingBooking) handleDeleteBooking(deletingBooking.id);
        }}
        title="Delete Consultation Booking"
        message={`Are you sure you want to delete the booking for ${deletingBooking?.clientName} (${deletingBooking?.id})? This action cannot be undone.`}
        confirmText="Delete Booking"
        isDestructive={true}
        isLoading={isDeleting}
      />

      {/* Confirm Clear All Bookings */}
      <ConfirmDialog
        isOpen={clearAllConfirmOpen}
        onClose={() => setClearAllConfirmOpen(false)}
        onConfirm={handleClearAllBookings}
        title="Clear All Bookings"
        message="Are you sure you want to remove all bookings from your practice database? This will remove all records permanently."
        confirmText="Clear All Records"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
