"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CalendarCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Eye,
  Video,
  MapPin,
  TrendingUp,
  User,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import Drawer from "@/components/admin/Drawer";
import { useToast } from "@/components/admin/Toast";
import type { Booking, Enquiry } from "@/lib/types";

export default function AdminDashboardPage() {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    todaySessionsCount: 0,
    upcomingBookingsCount: 0,
    pendingEnquiriesCount: 0,
    totalServicesCount: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Booking[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [analytics, setAnalytics] = useState<{
    total: number;
    completed: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    chartData: {
      date: string;
      label: string;
      total: number;
      completed: number;
      confirmed: number;
      pending: number;
      cancelled: number;
    }[];
  }>({
    total: 0,
    completed: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    chartData: [],
  });

  // Chart filter range
  const [chartRange, setChartRange] = useState<"7d" | "30d" | "3m" | "1y">("7d");

  // Selected booking for Drawer inspection
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [notesInput, setNotesInput] = useState("");

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setTodayAppointments(data.todayAppointments || []);
        setRecentEnquiries(data.recentEnquiries || []);
        setAnalytics(data.analytics);
      }
    } catch {
      error("Failed to load dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update notes when selected booking changes
  useEffect(() => {
    if (selectedBooking) {
      setNotesInput(selectedBooking.internalNotes || "");
    }
  }, [selectedBooking]);

  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        success(`Booking marked as ${newStatus}.`);
        setSelectedBooking(data.booking);
        fetchDashboardData();
      } else {
        error(data.error || "Failed to update booking.");
      }
    } catch {
      error("Error updating booking status.");
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
        success("Internal notes saved.");
        setSelectedBooking(data.booking);
        fetchDashboardData();
      } else {
        error(data.error || "Failed to save notes.");
      }
    } catch {
      error("Error saving notes.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
            {getGreeting()}, Aswathy 👋
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
            Here&apos;s what&apos;s happening with your practice today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/calendar"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-primary text-xs font-medium transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-forest-green" />
            <span>Open Calendar</span>
          </Link>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-green hover:bg-forest-green-hover text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Manage All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F4D242]" />
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Today's Sessions"
          value={isLoading ? "—" : metrics.todaySessionsCount}
          subtitle="Scheduled for today"
          icon={Clock}
          badge={metrics.todaySessionsCount > 0 ? "Active Today" : "Rest Day"}
          badgeType={metrics.todaySessionsCount > 0 ? "positive" : "neutral"}
        />
        <StatCard
          title="Upcoming Bookings"
          value={isLoading ? "—" : metrics.upcomingBookingsCount}
          subtitle="Next 14 days"
          icon={CalendarCheck}
          badge="+2 this week"
          badgeType="positive"
        />
        <StatCard
          title="Pending Enquiries"
          value={isLoading ? "—" : metrics.pendingEnquiriesCount}
          subtitle="Awaiting response"
          icon={MessageSquare}
          badge={metrics.pendingEnquiriesCount > 0 ? "Needs Review" : "All Clear"}
          badgeType={metrics.pendingEnquiriesCount > 0 ? "attention" : "positive"}
        />
        <StatCard
          title="Total Services"
          value={isLoading ? "—" : metrics.totalServicesCount}
          subtitle="Active specializations"
          icon={Sparkles}
          badge="Live on Site"
          badgeType="neutral"
        />
      </div>

      {/* Main Grid: Today's Appointments + Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols): Today's Schedule & Analytics */}
        <div className="lg:col-span-8 space-y-8">
          {/* Today's Appointments Card */}
          <div className="bg-surface rounded-3xl p-6 border border-parchment-border/80 shadow-[0_2px_14px_rgba(26,56,40,0.03)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container">
              <div>
                <span className="text-[11px] font-label-caps uppercase tracking-wider text-forest-green font-semibold block">
                  Today&apos;s Schedule
                </span>
                <h2 className="font-headline-sm text-lg text-primary font-semibold">
                  Today&apos;s Consultations
                </h2>
              </div>
              <span className="text-xs text-on-surface-variant">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-surface-container rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-2 text-on-surface-variant/60">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="font-headline-sm text-base text-primary">
                  No sessions scheduled today
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Enjoy your peaceful day or review upcoming client records.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-surface-container/60">
                {todayAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/40 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="px-3 py-1.5 rounded-xl bg-forest-green/10 text-forest-green font-sans font-semibold text-xs text-center min-w-[76px] whitespace-nowrap">
                        {appt.appointmentTime}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-primary">
                            {appt.clientName}
                          </span>
                          <span className="font-sans text-[10px] text-on-surface-variant/60">
                            ({appt.id})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                          <span>{appt.serviceName}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            {appt.format === "online" ? (
                              <>
                                <Video className="w-3 h-3 text-forest-green" />
                                <span>Online</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="w-3 h-3 text-forest-green" />
                                <span>In-Person</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <StatusBadge status={appt.bookingStatus} size="sm" />
                      <button
                        onClick={() => setSelectedBooking(appt)}
                        className="p-1.5 rounded-lg border border-surface-container hover:bg-surface hover:border-forest-green/40 text-on-surface-variant hover:text-forest-green transition-all cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Overview Analytics Card */}
          <div className="bg-surface rounded-3xl p-6 border border-parchment-border/80 shadow-[0_2px_14px_rgba(26,56,40,0.03)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
              <div>
                <span className="text-[11px] font-label-caps uppercase tracking-wider text-forest-green font-semibold block">
                  Practice Volume
                </span>
                <h2 className="font-headline-sm text-lg text-primary font-semibold">
                  Booking Overview &amp; Retention
                </h2>
              </div>

              {/* Range Filters */}
              <div className="flex bg-surface-container rounded-xl p-0.5 gap-0.5 text-xs">
                {(["7d", "30d", "3m", "1y"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      chartRange === r
                        ? "bg-forest-green text-white shadow-xs"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {r === "7d"
                      ? "7 Days"
                      : r === "30d"
                      ? "30 Days"
                      : r === "3m"
                      ? "3 Months"
                      : "1 Year"}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container">
                <span className="text-[11px] text-on-surface-variant block">Total Recorded</span>
                <span className="font-headline-sm text-lg font-semibold text-primary">
                  {analytics.total}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#E7F3EC] border border-[#C8E6C9]">
                <span className="text-[11px] text-[#1B5E20] block">Completed</span>
                <span className="font-headline-sm text-lg font-semibold text-[#1B5E20]">
                  {analytics.completed}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FEF7E0] border border-[#FEEAA0]">
                <span className="text-[11px] text-[#8D6B00] block">Pending</span>
                <span className="font-headline-sm text-lg font-semibold text-[#8D6B00]">
                  {analytics.pending}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FCE8E6] border border-[#FAD2CF]">
                <span className="text-[11px] text-[#BA1A1A] block">Cancelled</span>
                <span className="font-headline-sm text-lg font-semibold text-[#BA1A1A]">
                  {analytics.cancelled}
                </span>
              </div>
            </div>

            {/* Visual SVG Activity Chart */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-primary block mb-3">
                Daily Consultation Distribution (Past 7 Days)
              </span>
              <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-32 pt-4 px-2">
                {analytics.chartData.map((d, i) => {
                  const maxH = Math.max(...analytics.chartData.map((c) => c.total), 3);
                  const barH = Math.max(12, Math.round((d.total / maxH) * 100));

                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] font-sans text-on-surface-variant/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.total}
                      </div>
                      <div
                        style={{ height: `${barH}%` }}
                        className="w-full max-w-[32px] rounded-t-lg bg-forest-green/80 group-hover:bg-forest-green transition-all shadow-xs relative overflow-hidden"
                      >
                        {d.completed > 0 && (
                          <div
                            style={{ height: `${(d.completed / d.total) * 100}%` }}
                            className="w-full bg-[#F4D242] absolute bottom-0 left-0"
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-label-caps uppercase text-on-surface-variant truncate max-w-full">
                        {d.label.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 text-[11px] text-on-surface-variant">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-forest-green" />
                  <span>Scheduled Sessions</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F4D242]" />
                  <span>Completed Sessions</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Recent Enquiries & Quick Practice Notes */}
        <div className="lg:col-span-4 space-y-8">
          {/* Recent Enquiries Card */}
          <div className="bg-surface rounded-3xl p-6 border border-parchment-border/80 shadow-[0_2px_14px_rgba(26,56,40,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <span className="text-[11px] font-label-caps uppercase tracking-wider text-forest-green font-semibold block">
                  Incoming Messages
                </span>
                <h2 className="font-headline-sm text-lg text-primary font-semibold">
                  Recent Enquiries
                </h2>
              </div>
              <Link
                href="/admin/enquiries"
                className="text-xs text-forest-green hover:underline font-medium"
              >
                View All →
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-surface-container rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentEnquiries.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-6 text-center">
                No new enquiries received.
              </p>
            ) : (
              <div className="space-y-3">
                {recentEnquiries.map((enq) => (
                  <Link
                    key={enq.id}
                    href="/admin/enquiries"
                    className="block p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-primary truncate max-w-[130px]">
                        {enq.name}
                      </span>
                      <StatusBadge status={enq.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                      {enq.subject || enq.message}
                    </p>
                    <span className="text-[10px] text-on-surface-variant/60 block mt-1.5">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sanctuary Self-Care Practice Reminder */}
          <div className="bg-forest-green text-white rounded-3xl p-6 relative overflow-hidden shadow-md space-y-3">
            <div className="flex items-center gap-2 text-[#F4D242] text-xs font-label-caps uppercase tracking-wider font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Practitioner Care Sanctuary</span>
            </div>
            <h3 className="font-headline-sm text-lg font-semibold tracking-tight">
              &ldquo;You cannot pour from an empty cup.&rdquo;
            </h3>
            <p className="text-xs text-white/80 leading-relaxed font-body-sm">
              Remember to take your 15-minute nervous system buffer between consultations. Drink warm water and breathe gently.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-1.5 text-xs text-[#F4D242] hover:underline font-semibold"
              >
                <span>Adjust Buffer Times in Settings →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Side Drawer Inspection Modal */}
      <Drawer
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title="Consultation Details"
        subtitle={selectedBooking ? `Reference ID: ${selectedBooking.id}` : ""}
        footer={
          selectedBooking && (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
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
                    onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 rounded-full bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF] font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancel Session
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
                  Service Specialization
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
                Client Contact Information
              </span>
              <div className="p-4 rounded-2xl bg-surface border border-surface-container space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Client Name:</span>
                  <span className="font-semibold text-primary">{selectedBooking.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Email:</span>
                  <a
                    href={`mailto:${selectedBooking.clientEmail}`}
                    className="text-forest-green hover:underline"
                  >
                    {selectedBooking.clientEmail}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Phone:</span>
                  <a
                    href={`tel:${selectedBooking.clientPhone}`}
                    className="text-forest-green hover:underline"
                  >
                    {selectedBooking.clientPhone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Payment Status:</span>
                  <span className="capitalize font-medium text-primary">
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule & Format */}
            <div className="space-y-2">
              <span className="font-label-caps text-[11px] uppercase tracking-wider text-forest-green font-semibold block">
                Session Logistics
              </span>
              <div className="p-4 rounded-2xl bg-surface border border-surface-container space-y-2">
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
                  <span className="text-on-surface-variant">Consultation Format:</span>
                  <span className="capitalize font-medium text-primary flex items-center gap-1">
                    {selectedBooking.format === "online" ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-forest-green" />
                        <span>Online (Google Meet / Telehealth)</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-forest-green" />
                        <span>In-Person Studio (Chennai)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Client's Message */}
            {selectedBooking.clientMessage && (
              <div className="space-y-1">
                <span className="font-label-caps text-[11px] uppercase tracking-wider text-forest-green font-semibold block">
                  Intake Note from Client
                </span>
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container italic text-on-surface-variant leading-relaxed">
                  &ldquo;{selectedBooking.clientMessage}&rdquo;
                </div>
              </div>
            )}

            {/* Internal Practitioner Notes */}
            <div className="space-y-1.5">
              <span className="font-label-caps text-[11px] uppercase tracking-wider text-forest-green font-semibold block">
                Internal Clinical Notes (Confidential)
              </span>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Add private observations, session themes, or grounding homework..."
                className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container text-xs text-primary focus:outline-none focus:border-forest-green focus:bg-surface resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-3 py-1 rounded-full bg-surface border border-parchment-border hover:border-forest-green text-[11px] font-medium text-forest-green transition-colors cursor-pointer"
              >
                Save Notes
              </button>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-2 pt-2 border-t border-surface-container">
              <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant/70 font-semibold block">
                Activity Audit Log
              </span>
              <div className="space-y-2">
                {selectedBooking.history.map((h, idx) => (
                  <div key={idx} className="text-[11px] text-on-surface-variant flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-green shrink-0 mt-1" />
                    <div>
                      <span className="font-medium text-primary">{h.action}</span>
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
    </div>
  );
}
