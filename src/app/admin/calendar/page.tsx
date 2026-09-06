"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Video,
  MapPin,
  Lock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings2,
  Trash2,
  Eye,
  CalendarCheck,
  Check,
  X,
} from "lucide-react";
import Drawer from "@/components/admin/Drawer";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { Booking, BlockedSlot, AvailabilityRule } from "@/lib/db";

type CalendarView = "month" | "week" | "day";

// Safe field accessors
const getBookingDate = (b: Booking) => b.date || b.appointmentDate || "";
const getBookingTime = (b: Booking) => b.time || b.appointmentTime || "";
const getBookingStatus = (b: Booking): Booking["bookingStatus"] =>
  b.status || b.bookingStatus || "confirmed";
const getBookingModality = (b: Booking): "online" | "in-person" =>
  b.modality || b.format || "online";
const getBookingNotes = (b: Booking) => b.clientNotes || b.clientMessage || "";
const getBookingPrice = (b: Booking) => b.price || 1800;

export default function AdminCalendarPage() {
  const { success, error } = useToast();
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRule[]>([]);
  const [bookingSettings, setBookingSettings] = useState<{
    bufferTimeMinutes: number;
    advanceNoticeHours: number;
    maxAdvanceDays: number;
    slotDurationMinutes: number;
  }>({
    bufferTimeMinutes: 15,
    advanceNoticeHours: 24,
    maxAdvanceDays: 60,
    slotDurationMinutes: 60,
  });

  // Selected booking drawer state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState("");

  // Block time modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    title: "",
    type: "full_day" as "full_day" | "slot",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "13:00",
    reason: "",
  });
  const [isSavingBlock, setIsSavingBlock] = useState(false);

  // Availability Settings Modal state
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [editAvailability, setEditAvailability] = useState<AvailabilityRule[]>([]);
  const [editBookingSettings, setEditBookingSettings] = useState(bookingSettings);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  // Delete blocked slot dialog
  const [deletingBlockedId, setDeletingBlockedId] = useState<string | null>(null);

  // Load calendar data
  const loadCalendarData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/calendar");
      if (!res.ok) throw new Error("Failed to load schedule");
      const data = await res.json();
      setBookings(data.bookings || []);
      setBlockedSlots(data.blockedSlots || []);
      setAvailability(data.availability || []);

      // Also load booking settings from availability endpoint
      const availRes = await fetch("/api/admin/availability");
      if (availRes.ok) {
        const availData = await availRes.json();
        if (availData.settings) {
          const s = availData.settings;
          const normalized = {
            bufferTimeMinutes: s.bufferTimeMinutes || s.bufferTime || 15,
            advanceNoticeHours: s.advanceNoticeHours || 24,
            maxAdvanceDays: s.maxAdvanceDays || 60,
            slotDurationMinutes: s.defaultSessionDuration || 50,
          };
          setBookingSettings(normalized);
          setEditBookingSettings(normalized);
        }
      }
    } catch (err: any) {
      error(err.message || "Failed to load calendar data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  // Update editAvailability whenever availability changes
  useEffect(() => {
    setEditAvailability(JSON.parse(JSON.stringify(availability)));
  }, [availability]);

  // Sync selected booking notes
  useEffect(() => {
    if (selectedBooking) {
      setAdminNoteInput(selectedBooking.internalNotes || "");
    }
  }, [selectedBooking]);

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (view === "month") {
      next.setMonth(next.getMonth() - 1);
    } else if (view === "week") {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (view === "month") {
      next.setMonth(next.getMonth() + 1);
    } else if (view === "week") {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month navigation calculation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get starting day (Monday = 0 ... Sunday = 6)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toISOString().split("T")[0],
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        date: d,
        isCurrentMonth: true,
        dateStr: dStr,
      });
    }

    // Next month padding to fill complete weeks (42 total slots or 35)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toISOString().split("T")[0],
      });
    }

    return {
      year,
      month,
      monthName: currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      days,
    };
  }, [currentDate]);

  // Week view calculation
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        isToday: new Date().toDateString() === d.toDateString(),
      });
    }
    return days;
  }, [currentDate]);

  // Day view date string
  const dayDateStr = useMemo(() => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
  }, [currentDate]);

  // Map bookings and blocked slots by date
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const bDate = getBookingDate(b);
      const list = map.get(bDate) || [];
      list.push(b);
      map.set(bDate, list);
    });
    return map;
  }, [bookings]);

  const blockedByDate = useMemo(() => {
    const map = new Map<string, BlockedSlot[]>();
    blockedSlots.forEach((blk) => {
      const list = map.get(blk.date) || [];
      list.push(blk);
      map.set(blk.date, list);
    });
    return map;
  }, [blockedSlots]);

  // Action handlers
  const handleUpdateStatus = async (status: Booking["bookingStatus"]) => {
    if (!selectedBooking) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, bookingStatus: status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      success(`Booking status changed to ${status}`);
      setSelectedBooking(data.booking);
      loadCalendarData();
    } catch (err: any) {
      error(err.message || "Failed to update appointment");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: adminNoteInput }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      const data = await res.json();
      success("Consultation notes saved securely.");
      setSelectedBooking(data.booking);
      loadCalendarData();
    } catch (err: any) {
      error(err.message || "Failed to save notes");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Block Slot
  const handleSaveBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockForm.title.trim()) {
      error("Please enter a title for the blocked time.");
      return;
    }
    setIsSavingBlock(true);
    try {
      const res = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockForm),
      });
      if (!res.ok) throw new Error("Failed to block slot");
      success("Time blocked successfully.");
      setIsBlockModalOpen(false);
      setBlockForm({
        title: "",
        type: "full_day",
        date: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "13:00",
        reason: "",
      });
      loadCalendarData();
    } catch (err: any) {
      error(err.message || "Failed to block time");
    } finally {
      setIsSavingBlock(false);
    }
  };

  // Delete Blocked Slot
  const handleDeleteBlockedSlot = async () => {
    if (!deletingBlockedId) return;
    try {
      const res = await fetch(`/api/admin/calendar?id=${deletingBlockedId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove blocked slot");
      success("Blocked slot removed.");
      setDeletingBlockedId(null);
      loadCalendarData();
    } catch (err: any) {
      error(err.message || "Failed to remove blocked slot");
    }
  };

  // Save Availability Settings
  const handleSaveAvailability = async () => {
    setIsSavingAvailability(true);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rules: editAvailability,
          bookingSettings: editBookingSettings,
        }),
      });
      if (!res.ok) throw new Error("Failed to update availability");
      success("Practice availability & booking rules updated.");
      setIsAvailabilityModalOpen(false);
      loadCalendarData();
    } catch (err: any) {
      error(err.message || "Failed to save availability settings");
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
            <span>Schedule & Calendar</span>
            <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-[#1A3828]/10 text-[#1A3828]">
              {bookings.length} Consultations
            </span>
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Review client sessions, manage your clinical availability, and plan time off.
          </p>
        </div>

        {/* Buttons & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Working Hours & Availability */}
          <button
            onClick={() => setIsAvailabilityModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#1A3828]/20 bg-white/70 hover:bg-white text-[#1A3828] transition-all flex items-center gap-2 shadow-sm"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#1A3828]" />
            <span>Working Hours</span>
          </button>

          {/* Block Time / Holiday */}
          <button
            onClick={() => {
              setBlockForm((prev) => ({
                ...prev,
                date: view === "day" ? dayDateStr : new Date().toISOString().split("T")[0],
              }));
              setIsBlockModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Block Time / Leave</span>
          </button>
        </div>
      </div>

      {/* Navigation Bar & Filter Controls */}
      <div className="bg-white/80 backdrop-blur-sm border border-[#1A3828]/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl hover:bg-[#1A3828]/5 text-[#1A3828] border border-[#1A3828]/10 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828] transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl hover:bg-[#1A3828]/5 text-[#1A3828] border border-[#1A3828]/10 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="font-playfair text-lg md:text-xl font-semibold text-[#1A3828]">
            {view === "month" && monthData.monthName}
            {view === "week" &&
              `Week of ${weekDays[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDays[6].date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            {view === "day" &&
              currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </h2>
        </div>

        {/* Legend and View Switcher */}
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          {/* Status Color Indicators */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-[#7B7368]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700/60"></span> Blocked
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-[#1A3828]/5 rounded-xl border border-[#1A3828]/10">
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                view === "month"
                  ? "bg-white text-[#1A3828] font-semibold shadow-xs"
                  : "text-[#7B7368] hover:text-[#1A3828]"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                view === "week"
                  ? "bg-white text-[#1A3828] font-semibold shadow-xs"
                  : "text-[#7B7368] hover:text-[#1A3828]"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("day")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                view === "day"
                  ? "bg-white text-[#1A3828] font-semibold shadow-xs"
                  : "text-[#7B7368] hover:text-[#1A3828]"
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar View Body */}
      {isLoading ? (
        <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
          <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-sans text-[#7B7368]">Loading schedule and bookings...</p>
        </div>
      ) : (
        <>
          {/* VIEW: MONTH */}
          {view === "month" && (
            <div className="bg-white rounded-2xl border border-[#1A3828]/10 shadow-sm overflow-hidden">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 border-b border-[#1A3828]/10 bg-[#FCF9F2]/70 text-center py-2.5 text-xs font-semibold text-[#1A3828]/80 uppercase tracking-wider">
                {dayNames.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#1A3828]/5 bg-[#FCF9F2]/20">
                {monthData.days.map((item, idx) => {
                  const dayBookings = appointmentsByDate.get(item.dateStr) || [];
                  const dayBlocked = blockedByDate.get(item.dateStr) || [];
                  const isToday = new Date().toDateString() === item.date.toDateString();

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentDate(item.date);
                      }}
                      className={`min-h-[110px] md:min-h-[130px] p-2 transition-colors flex flex-col justify-between ${
                        item.isCurrentMonth ? "bg-white" : "bg-[#FCF9F2]/60 text-slate-400"
                      } ${isToday ? "ring-2 ring-inset ring-[#F4D242]" : ""}`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday
                              ? "bg-[#1A3828] text-white"
                              : item.isCurrentMonth
                              ? "text-[#1A3828]"
                              : "text-slate-400"
                          }`}
                        >
                          {item.date.getDate()}
                        </span>

                        {dayBookings.length > 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[#1A3828]/5 text-[#1A3828]">
                            {dayBookings.length} {dayBookings.length === 1 ? "session" : "sessions"}
                          </span>
                        )}
                      </div>

                      {/* Day Items Stack */}
                      <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] pr-0.5">
                        {/* Blocked Slots Banner */}
                        {dayBlocked.map((blk) => (
                          <div
                            key={blk.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingBlockedId(blk.id);
                            }}
                            className="text-[11px] px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 font-medium truncate flex items-center justify-between cursor-pointer hover:bg-amber-200"
                            title={`${blk.title} - ${blk.reason || ""}. Click to remove.`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 shrink-0" />
                              {blk.title}
                            </span>
                          </div>
                        ))}

                        {/* Consultation Pills */}
                        {dayBookings.map((b) => {
                          const status = getBookingStatus(b);
                          const time = getBookingTime(b);
                          const modality = getBookingModality(b);

                          let pillStyle = "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100";
                          if (status === "pending") {
                            pillStyle = "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100";
                          } else if (status === "completed") {
                            pillStyle = "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
                          } else if (status === "cancelled") {
                            pillStyle = "bg-rose-50 text-rose-700 border-rose-200 line-through opacity-70";
                          }

                          return (
                            <button
                              key={b.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(b);
                              }}
                              className={`w-full text-left text-[11px] px-1.5 py-1 rounded border font-medium truncate transition-colors flex items-center justify-between ${pillStyle}`}
                            >
                              <span className="truncate">
                                <span className="font-semibold mr-1">{time}</span>
                                {b.clientName}
                              </span>
                              {modality === "online" ? (
                                <Video className="w-2.5 h-2.5 shrink-0 ml-1 opacity-70" />
                              ) : (
                                <MapPin className="w-2.5 h-2.5 shrink-0 ml-1 opacity-70" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Add Button on Hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBlockForm((prev) => ({ ...prev, date: item.dateStr }));
                          setIsBlockModalOpen(true);
                        }}
                        className="text-[10px] text-[#7B7368] hover:text-[#1A3828] text-right pt-1 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        + Block
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: WEEK */}
          {view === "week" && (
            <div className="bg-white rounded-2xl border border-[#1A3828]/10 shadow-sm overflow-x-auto">
              <div className="min-w-[840px]">
                {/* 7 Days Header */}
                <div className="grid grid-cols-7 border-b border-[#1A3828]/10 bg-[#FCF9F2]/70 text-center py-3">
                  {weekDays.map((col) => (
                    <div
                      key={col.dateStr}
                      className={`px-2 ${col.isToday ? "text-[#1A3828] font-bold" : "text-[#7B7368]"}`}
                    >
                      <div className="text-xs uppercase font-medium">{col.dayName}</div>
                      <div
                        className={`text-base font-playfair mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full ${
                          col.isToday ? "bg-[#1A3828] text-white" : ""
                        }`}
                      >
                        {col.dayNumber}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 7 Days Columns Content */}
                <div className="grid grid-cols-7 divide-x divide-[#1A3828]/10 min-h-[480px]">
                  {weekDays.map((col) => {
                    const dayBookings = appointmentsByDate.get(col.dateStr) || [];
                    const dayBlocked = blockedByDate.get(col.dateStr) || [];

                    return (
                      <div key={col.dateStr} className="p-3 space-y-3 bg-[#FCF9F2]/10">
                        {/* Blocked slots banner */}
                        {dayBlocked.map((blk) => (
                          <div
                            key={blk.id}
                            onClick={() => setDeletingBlockedId(blk.id)}
                            className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-xs cursor-pointer hover:bg-amber-100"
                            title="Click to remove"
                          >
                            <div className="font-semibold flex items-center gap-1 text-[11px]">
                              <Lock className="w-3 h-3 shrink-0" />
                              {blk.title}
                            </div>
                            {blk.startTime && (
                              <div className="text-[10px] text-amber-800 mt-0.5">
                                {blk.startTime} - {blk.endTime}
                              </div>
                            )}
                            {blk.reason && (
                              <p className="text-[10px] text-amber-700/80 mt-1 italic">{blk.reason}</p>
                            )}
                          </div>
                        ))}

                        {/* Appointments Cards */}
                        {dayBookings.length === 0 && dayBlocked.length === 0 && (
                          <div className="h-32 flex flex-col items-center justify-center text-center p-2 text-slate-400">
                            <span className="text-xs">No sessions</span>
                          </div>
                        )}

                        {dayBookings.map((b) => {
                          const status = getBookingStatus(b);
                          const time = getBookingTime(b);
                          const modality = getBookingModality(b);

                          return (
                            <div
                              key={b.id}
                              onClick={() => setSelectedBooking(b)}
                              className="p-3 rounded-xl bg-white border border-[#1A3828]/10 hover:border-[#1A3828]/30 shadow-xs hover:shadow-sm cursor-pointer transition-all space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#1A3828] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#1A3828]/60" />
                                  {time}
                                </span>
                                <StatusBadge status={status} />
                              </div>

                              <h4 className="font-semibold text-sm text-[#1A3828] truncate">{b.clientName}</h4>
                              <p className="text-xs text-[#7B7368] truncate">{b.serviceName}</p>

                              <div className="pt-1.5 border-t border-[#1A3828]/5 flex items-center justify-between text-[11px] text-[#7B7368]">
                                <span className="flex items-center gap-1">
                                  {modality === "online" ? (
                                    <>
                                      <Video className="w-3 h-3 text-emerald-600" /> Online
                                    </>
                                  ) : (
                                    <>
                                      <MapPin className="w-3 h-3 text-amber-600" /> In-Person
                                    </>
                                  )}
                                </span>
                                <span className="font-medium text-[#1A3828]">{b.durationMinutes}m</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: DAY */}
          {view === "day" && (
            <div className="space-y-4">
              {/* Day Header Summary */}
              <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-playfair text-xl font-semibold text-[#1A3828]">
                    {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </h3>
                  <p className="text-xs text-[#7B7368] mt-0.5">
                    {(appointmentsByDate.get(dayDateStr) || []).length} appointments scheduled •{" "}
                    {(blockedByDate.get(dayDateStr) || []).length} blocked intervals
                  </p>
                </div>
                <button
                  onClick={() => {
                    setBlockForm((prev) => ({ ...prev, date: dayDateStr }));
                    setIsBlockModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Block Time on this Day</span>
                </button>
              </div>

              {/* Day Timeline */}
              <div className="space-y-3">
                {/* Blocked Slots on this Day */}
                {(blockedByDate.get(dayDateStr) || []).map((blk) => (
                  <div
                    key={blk.id}
                    className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-amber-900">{blk.title}</h4>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                            {blk.type === "full_day" ? "Full Day Holiday" : `${blk.startTime} - ${blk.endTime}`}
                          </span>
                        </div>
                        {blk.reason && <p className="text-xs text-amber-800/80 mt-0.5">{blk.reason}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeletingBlockedId(blk.id)}
                      className="p-2 rounded-lg text-amber-700 hover:text-rose-700 hover:bg-amber-100 transition-colors"
                      title="Remove blocked slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Consultations List on this Day */}
                {!(appointmentsByDate.get(dayDateStr) || []).length && (
                  <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm">
                    <CalendarIcon className="w-12 h-12 text-[#1A3828]/20 mx-auto mb-3" />
                    <h4 className="font-playfair text-lg font-semibold text-[#1A3828]">
                      No consultations scheduled
                    </h4>
                    <p className="text-xs text-[#7B7368] mt-1 max-w-sm mx-auto">
                      There are no client bookings for this day. You can enjoy your free time or schedule clinical blocks.
                    </p>
                  </div>
                )}

                {(appointmentsByDate.get(dayDateStr) || []).map((b) => {
                  const status = getBookingStatus(b);
                  const time = getBookingTime(b);
                  const modality = getBookingModality(b);
                  const price = getBookingPrice(b);

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className="bg-white rounded-2xl border border-[#1A3828]/10 hover:border-[#1A3828]/30 p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        {/* Time pill */}
                        <div className="w-20 text-center py-2 px-1 rounded-xl bg-[#FCF9F2] border border-[#1A3828]/10 shrink-0">
                          <div className="text-xs font-bold text-[#1A3828]">{time}</div>
                          <div className="text-[10px] text-[#7B7368]">{b.durationMinutes} min</div>
                        </div>

                        {/* Client & Service Info */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-[#1A3828] text-base">{b.clientName}</h4>
                            <StatusBadge status={status} />
                          </div>
                          <p className="text-xs text-[#7B7368] mt-0.5">{b.serviceName}</p>
                          <div className="flex items-center gap-4 text-xs text-[#7B7368] mt-2">
                            <span className="flex items-center gap-1.5">
                              {modality === "online" ? (
                                <>
                                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Online Consultation</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                  <span>In-Person Sanctuary</span>
                                </>
                              )}
                            </span>
                            <span>•</span>
                            <span>₹{price}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(b);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828] transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* APPOINTMENT DETAILS DRAWER */}
      <Drawer
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title="Consultation Details"
        subtitle={selectedBooking ? `${getBookingDate(selectedBooking)} at ${getBookingTime(selectedBooking)}` : ""}
        footer={
          selectedBooking && (
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                {getBookingStatus(selectedBooking) !== "completed" && (
                  <button
                    onClick={() => handleUpdateStatus("completed")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}
                {getBookingStatus(selectedBooking) !== "cancelled" && (
                  <button
                    onClick={() => handleUpdateStatus("cancelled")}
                    disabled={isUpdatingStatus}
                    className="px-3 py-2 text-xs font-semibold rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828]"
              >
                Close
              </button>
            </div>
          )
        }
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Status & Service Banner */}
            <div className="bg-[#FCF9F2] p-4 rounded-2xl border border-[#1A3828]/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#7B7368] uppercase font-bold tracking-wider">Service</span>
                <h4 className="font-playfair text-base font-semibold text-[#1A3828]">
                  {selectedBooking.serviceName}
                </h4>
              </div>
              <StatusBadge status={getBookingStatus(selectedBooking)} />
            </div>

            {/* Client Demographics */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#7B7368]">Client Profile</h5>
              <div className="bg-white p-4 rounded-2xl border border-[#1A3828]/10 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#7B7368]">Name</span>
                  <span className="font-semibold text-[#1A3828]">{selectedBooking.clientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B7368]">Email</span>
                  <a
                    href={`mailto:${selectedBooking.clientEmail}`}
                    className="text-[#1A3828] underline font-medium hover:opacity-80"
                  >
                    {selectedBooking.clientEmail}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B7368]">Phone</span>
                  <a
                    href={`tel:${selectedBooking.clientPhone}`}
                    className="text-[#1A3828] font-medium hover:opacity-80"
                  >
                    {selectedBooking.clientPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#7B7368]">Session Specifications</h5>
              <div className="bg-white p-4 rounded-2xl border border-[#1A3828]/10 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#7B7368]">Date & Time</span>
                  <span className="font-semibold text-[#1A3828]">
                    {getBookingDate(selectedBooking)} at {getBookingTime(selectedBooking)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B7368]">Duration</span>
                  <span className="font-medium text-[#1A3828]">{selectedBooking.durationMinutes} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B7368]">Format</span>
                  <span className="font-medium text-[#1A3828] capitalize">{getBookingModality(selectedBooking)}</span>
                </div>
                {selectedBooking.meetingLink && (
                  <div className="pt-2 border-t border-[#1A3828]/5 flex flex-col gap-1">
                    <span className="text-xs text-[#7B7368]">Video Consultation Link:</span>
                    <a
                      href={selectedBooking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1A3828] underline break-all bg-[#FCF9F2] p-2 rounded-lg font-mono"
                    >
                      {selectedBooking.meetingLink}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Client Message */}
            {getBookingNotes(selectedBooking) && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#7B7368]">Client’s Intake Note</h5>
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900 italic">
                  "{getBookingNotes(selectedBooking)}"
                </div>
              </div>
            )}

            {/* Clinical Internal Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#7B7368]">
                  Confidential Clinical Notes
                </h5>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  Private to Psychologist
                </span>
              </div>
              <textarea
                rows={4}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Write private notes on consultation progress, therapeutic themes, or follow-up plans..."
                className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828] resize-none"
              />
              <div className="text-right">
                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1A3828] text-white hover:bg-[#142C1F] transition-colors disabled:opacity-50"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* BLOCK TIME / HOLIDAY MODAL */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title="Block Time or Leave"
        subtitle="Mark personal time off, holidays, or clinical prep intervals so clients cannot book slots."
        maxWidth="md"
      >
        <form onSubmit={handleSaveBlockSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">Title / Reason *</label>
            <input
              type="text"
              required
              placeholder="e.g., Annual Leave, Conference, Research Day"
              value={blockForm.title}
              onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">Type</label>
              <select
                value={blockForm.type}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, type: e.target.value as "full_day" | "slot" })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white"
              >
                <option value="full_day">Full Day Leave</option>
                <option value="slot">Specific Time Slot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">Date *</label>
              <input
                type="date"
                required
                value={blockForm.date}
                onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none"
              />
            </div>
          </div>

          {blockForm.type === "slot" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">Start Time</label>
                <input
                  type="time"
                  value={blockForm.startTime}
                  onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">End Time</label>
                <input
                  type="time"
                  value={blockForm.endTime}
                  onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">Additional Note (Optional)</label>
            <textarea
              rows={2}
              placeholder="Internal reminders..."
              value={blockForm.reason}
              onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[#1A3828]/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBlockModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingBlock}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] hover:bg-[#142C1F] text-white transition-all disabled:opacity-50 shadow-sm"
            >
              {isSavingBlock ? "Blocking..." : "Save Blocked Time"}
            </button>
          </div>
        </form>
      </Modal>

      {/* AVAILABILITY & WORKING HOURS MODAL */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title="Clinical Availability & Booking Rules"
        subtitle="Configure your active practice days, consultation hours, and scheduling buffer."
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Day-by-Day Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B7368]">Weekly Working Hours</h4>
            <div className="space-y-2">
              {editAvailability.map((rule, idx) => {
                const dayLabel = typeof rule.dayOfWeek === "number"
                  ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][rule.dayOfWeek]
                  : String(rule.dayOfWeek).charAt(0).toUpperCase() + String(rule.dayOfWeek).slice(1);
                const isDayActive = rule.isActive !== undefined ? rule.isActive : rule.isWorking;

                return (
                  <div
                    key={rule.id || String(rule.dayOfWeek)}
                    className={`p-3 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                      isDayActive
                        ? "bg-white border-[#1A3828]/15"
                        : "bg-[#FCF9F2]/60 border-[#1A3828]/5 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-32">
                      <input
                        type="checkbox"
                        id={`day-${String(rule.dayOfWeek)}`}
                        checked={isDayActive}
                        onChange={(e) => {
                          const updated = [...editAvailability];
                          updated[idx].isActive = e.target.checked;
                          updated[idx].isWorking = e.target.checked;
                          setEditAvailability(updated);
                        }}
                        className="w-4 h-4 rounded text-[#1A3828] focus:ring-[#1A3828]"
                      />
                      <label htmlFor={`day-${String(rule.dayOfWeek)}`} className="text-xs font-semibold text-[#1A3828] cursor-pointer">
                        {dayLabel}
                      </label>
                    </div>

                    {isDayActive ? (
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <input
                          type="time"
                          value={rule.startTime}
                          onChange={(e) => {
                            const updated = [...editAvailability];
                            updated[idx].startTime = e.target.value;
                            setEditAvailability(updated);
                          }}
                          className="text-xs p-1.5 rounded-lg border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none"
                        />
                        <span className="text-xs text-[#7B7368]">to</span>
                        <input
                          type="time"
                          value={rule.endTime}
                          onChange={(e) => {
                            const updated = [...editAvailability];
                            updated[idx].endTime = e.target.value;
                            setEditAvailability(updated);
                          }}
                          className="text-xs p-1.5 rounded-lg border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-[#7B7368] italic">Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buffer & Booking Policies */}
          <div className="space-y-3 pt-4 border-t border-[#1A3828]/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B7368]">Buffer & Notice Rules</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">Buffer Between Sessions</label>
                <select
                  value={editBookingSettings.bufferTimeMinutes}
                  onChange={(e) =>
                    setEditBookingSettings({
                      ...editBookingSettings,
                      bufferTimeMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white"
                >
                  <option value={0}>No buffer</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes (Standard)</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">Minimum Advance Notice</label>
                <select
                  value={editBookingSettings.advanceNoticeHours}
                  onChange={(e) =>
                    setEditBookingSettings({
                      ...editBookingSettings,
                      advanceNoticeHours: Number(e.target.value),
                    })
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white"
                >
                  <option value={2}>2 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours (Recommended)</option>
                  <option value={48}>48 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">Max Booking Window</label>
                <select
                  value={editBookingSettings.maxAdvanceDays}
                  onChange={(e) =>
                    setEditBookingSettings({
                      ...editBookingSettings,
                      maxAdvanceDays: Number(e.target.value),
                    })
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white"
                >
                  <option value={30}>30 days ahead</option>
                  <option value={60}>60 days ahead</option>
                  <option value={90}>90 days ahead</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1A3828]/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAvailabilityModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAvailability}
              disabled={isSavingAvailability}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] hover:bg-[#142C1F] text-white transition-all disabled:opacity-50 shadow-sm"
            >
              {isSavingAvailability ? "Saving..." : "Save Availability"}
            </button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE BLOCKED SLOT */}
      <ConfirmDialog
        isOpen={Boolean(deletingBlockedId)}
        title="Remove Blocked Time"
        message="Are you sure you want to remove this blocked time slot? Clients will be able to book during this period according to your working hours."
        confirmText="Remove Block"
        isDestructive={true}
        onConfirm={handleDeleteBlockedSlot}
        onClose={() => setDeletingBlockedId(null)}
      />
    </div>
  );
}
