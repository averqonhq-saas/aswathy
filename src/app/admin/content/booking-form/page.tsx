"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Plus,
  Trash2,
  Save,
  Clock,
  ExternalLink,
  Settings2,
  Sliders,
  ShieldCheck,
  MessageSquare,
  Calendar,
  Sparkles,
  Coffee,
  Utensils,
  CreditCard,
  Wallet,
  CalendarOff,
  Palmtree,
  AlertCircle,
  Ban,
  Megaphone,
  Bell,
  Info,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import {
  SessionFormat,
  BookingFormConfig,
  SingleDaySlotOverride,
  BookingTimeSlot,
  TimeBreak,
  DEFAULT_BOOKING_FORM_CONFIG,
  DEFAULT_SESSION_FORMATS,
  generateSlotsFromRange,
  formatMinutesTo12Hour,
  parseTimeToMinutes,
} from "@/lib/booking-config";

export default function AdminBookingFormControlPage() {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<"slots" | "notice" | "payments" | "text" | "intake">("slots");

  const [formats, setFormats] = useState<SessionFormat[]>(DEFAULT_SESSION_FORMATS);
  const [config, setConfig] = useState<BookingFormConfig>(DEFAULT_BOOKING_FORM_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotIsEvening, setNewSlotIsEvening] = useState(false);
  const [newChannelText, setNewChannelText] = useState("");

  // Particular Day Time Range State (From ... To ...)
  const [particularDate, setParticularDate] = useState("");
  const [isDateRangeMode, setIsDateRangeMode] = useState(false);
  const [particularEndDate, setParticularEndDate] = useState("");
  const [rangeFromTime, setRangeFromTime] = useState("10:00");
  const [rangeToTime, setRangeToTime] = useState("18:00");
  const [rangeSlotDuration, setRangeSlotDuration] = useState(50);
  const [rangeBuffer, setRangeBuffer] = useState(10);
  const [enableBreaks, setEnableBreaks] = useState(false);
  const [breaksList, setBreaksList] = useState<TimeBreak[]>([
    { id: "break_1", from: "13:00", to: "14:00", label: "Lunch Break" },
  ]);
  const [rangeNote, setRangeNote] = useState("");
  const [dayScheduleMode, setDayScheduleMode] = useState<"slots" | "leave">("slots");
  const [leaveReason, setLeaveReason] = useState("Therapist on Leave");
  const [customLeaveNote, setCustomLeaveNote] = useState("");

  const handleAddBreak = (preset?: { from: string; to: string; label: string }) => {
    const id = `brk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBreak: TimeBreak = preset
      ? { id, ...preset }
      : {
          id,
          from: "16:30",
          to: "17:00",
          label: "Tea Break",
        };
    setBreaksList((prev) => [...prev, newBreak]);
    if (!enableBreaks) setEnableBreaks(true);
  };

  const handleUpdateBreak = (id: string | undefined, field: "from" | "to" | "label", value: string) => {
    if (!id) return;
    setBreaksList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleRemoveBreak = (id: string | undefined) => {
    if (!id) return;
    setBreaksList((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      if (updated.length === 0) {
        setEnableBreaks(false);
      }
      return updated;
    });
  };



  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/content/booking-form", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load booking form controls");
      const result = await res.json();
      if (result.data) {
        if (result.data.config) setConfig(result.data.config);
        if (Array.isArray(result.data.formats) && result.data.formats.length > 0) {
          setFormats(result.data.formats);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------------------------------
  // TIME SLOTS HANDLERS
  // ----------------------------------------------------
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime.trim()) return;
    const updated = [
      ...config.timeSlots,
      { time: newSlotTime.trim(), isEvening: newSlotIsEvening },
    ];
    setConfig({ ...config, timeSlots: updated });
    setNewSlotTime("");
    setNewSlotIsEvening(false);
    success(`Slot "${newSlotTime.trim()}" added.`);
  };

  const handleDeleteSlot = (slotIndex: number) => {
    const updated = config.timeSlots.filter((_, idx) => idx !== slotIndex);
    setConfig({ ...config, timeSlots: updated });
  };

  // ----------------------------------------------------
  // PARTICULAR DAY TIME RANGE HANDLERS (From ... To ...)
  // ----------------------------------------------------
  const previewGeneratedSlots = useMemo(() => {
    const activeBreaks = enableBreaks ? breaksList.filter((b) => b.from && b.to) : [];
    return generateSlotsFromRange(
      rangeFromTime,
      rangeToTime,
      rangeSlotDuration,
      rangeBuffer,
      activeBreaks
    );
  }, [
    rangeFromTime,
    rangeToTime,
    rangeSlotDuration,
    rangeBuffer,
    enableBreaks,
    breaksList,
  ]);

  const handleApplyRangeToDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!particularDate) {
      error("Please select a date.");
      return;
    }
    if (previewGeneratedSlots.length === 0) {
      error(`No slots generated for range From ${rangeFromTime} to ${rangeToTime}. Check start and end times.`);
      return;
    }

    const currentList = config.singleDaySlots ? [...config.singleDaySlots] : [];
    const datesToApply: string[] = [];

    if (isDateRangeMode && particularEndDate) {
      const start = new Date(particularDate + "T00:00:00");
      const end = new Date(particularEndDate + "T00:00:00");
      if (end < start) {
        error("End date cannot be earlier than start date.");
        return;
      }
      const curr = new Date(start);
      while (curr <= end) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, "0");
        const d = String(curr.getDate()).padStart(2, "0");
        datesToApply.push(`${y}-${m}-${d}`);
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      datesToApply.push(particularDate);
    }

    const activeBreaks = enableBreaks ? breaksList.filter((b) => b.from && b.to) : [];

    for (const d of datesToApply) {
      const existingIndex = currentList.findIndex((item) => item.date === d);
      const overrideObj: SingleDaySlotOverride = {
        id: existingIndex >= 0 ? currentList[existingIndex].id : `sds_${Date.now()}_${d}`,
        date: d,
        fromTime: formatMinutesTo12Hour(parseTimeToMinutes(rangeFromTime)),
        toTime: formatMinutesTo12Hour(parseTimeToMinutes(rangeToTime)),
        slotDurationMinutes: rangeSlotDuration,
        note: rangeNote.trim() || undefined,
        breaks: activeBreaks.length > 0 ? [...activeBreaks] : undefined,
        slots: [...previewGeneratedSlots],
      };

      if (existingIndex >= 0) {
        currentList[existingIndex] = overrideObj;
      } else {
        currentList.push(overrideObj);
      }
    }

    currentList.sort((a, b) => a.date.localeCompare(b.date));
    setConfig({ ...config, singleDaySlots: currentList });
    success(
      `Saved From ${formatMinutesTo12Hour(parseTimeToMinutes(rangeFromTime))} To ${formatMinutesTo12Hour(
        parseTimeToMinutes(rangeToTime)
      )} (${previewGeneratedSlots.length} slots) for ${
        datesToApply.length === 1 ? particularDate : `${datesToApply.length} days`
      }.`
    );
  };

  const handleRemoveSingleDaySlot = (date: string, slotIndex: number) => {
    const currentList = config.singleDaySlots ? [...config.singleDaySlots] : [];
    const existingIndex = currentList.findIndex((item) => item.date === date);
    if (existingIndex < 0) return;

    const existing = currentList[existingIndex];
    const newSlots = existing.slots.filter((_, idx) => idx !== slotIndex);
    if (newSlots.length === 0) {
      currentList.splice(existingIndex, 1);
    } else {
      currentList[existingIndex] = { ...existing, slots: newSlots };
    }
    setConfig({ ...config, singleDaySlots: currentList });
    success("Slot removed from single day.");
  };


  const handleDeleteSingleDayOverride = (date: string) => {
    const currentList = (config.singleDaySlots || []).filter((item) => item.date !== date);
    setConfig({ ...config, singleDaySlots: currentList });
    success(`Custom slots/leave for ${date} removed.`);
  };

  const handleApplyLeaveToDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!particularDate) {
      error("Please select a date for the leave.");
      return;
    }

    const currentList = config.singleDaySlots ? [...config.singleDaySlots] : [];
    const datesToApply: string[] = [];

    if (isDateRangeMode && particularEndDate) {
      const start = new Date(particularDate + "T00:00:00");
      const end = new Date(particularEndDate + "T00:00:00");
      if (end < start) {
        error("End date cannot be earlier than start date.");
        return;
      }
      const curr = new Date(start);
      while (curr <= end) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, "0");
        const d = String(curr.getDate()).padStart(2, "0");
        datesToApply.push(`${y}-${m}-${d}`);
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      datesToApply.push(particularDate);
    }

    const finalReason = leaveReason.trim() || "Therapist on Leave";
    const finalNote = customLeaveNote.trim() || finalReason;

    for (const d of datesToApply) {
      const existingIndex = currentList.findIndex((item) => item.date === d);
      const overrideObj: SingleDaySlotOverride = {
        id: existingIndex >= 0 ? currentList[existingIndex].id : `sds_${Date.now()}_${d}`,
        date: d,
        isOffDay: true,
        leaveReason: finalReason,
        note: finalNote,
        slots: [],
      };

      if (existingIndex >= 0) {
        currentList[existingIndex] = overrideObj;
      } else {
        currentList.push(overrideObj);
      }
    }

    currentList.sort((a, b) => a.date.localeCompare(b.date));
    setConfig({ ...config, singleDaySlots: currentList });
    success(
      `Marked as Leave (No Slots Available) for ${
        datesToApply.length === 1 ? particularDate : `${datesToApply.length} days`
      }. (${finalReason})`
    );
  };

  const handleToggleDayOff = (date: string) => {
    const currentList = config.singleDaySlots ? [...config.singleDaySlots] : [];
    const existingIndex = currentList.findIndex((item) => item.date === date);
    if (existingIndex < 0) return;

    const existing = currentList[existingIndex];
    if (existing.isOffDay) {
      // Switch back to working day with standard range slots
      const defSlots = generateSlotsFromRange("10:00", "18:00", 50, 10);
      currentList[existingIndex] = {
        ...existing,
        isOffDay: false,
        fromTime: "10:00 AM",
        toTime: "06:00 PM",
        note: undefined,
        leaveReason: undefined,
        slots: defSlots,
      };
      setConfig({ ...config, singleDaySlots: currentList });
      success(`Switched ${date} back to Active Working Day (${defSlots.length} slots).`);
    } else {
      // Switch to leave
      currentList[existingIndex] = {
        ...existing,
        isOffDay: true,
        leaveReason: "Therapist on Leave",
        note: "Therapist on Leave (No Slots Available)",
        slots: [],
      };
      setConfig({ ...config, singleDaySlots: currentList });
      success(`Marked ${date} as On Leave (No Slots).`);
    }
  };


  // ----------------------------------------------------
  // CHANNELS HANDLERS
  // ----------------------------------------------------
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelText.trim()) return;
    const updated = [...config.contactChannels, newChannelText.trim()];
    setConfig({ ...config, contactChannels: updated });
    setNewChannelText("");
    success(`Contact channel "${newChannelText.trim()}" added.`);
  };

  const handleDeleteChannel = (index: number) => {
    const updated = config.contactChannels.filter((_, idx) => idx !== index);
    setConfig({ ...config, contactChannels: updated });
  };

  // ----------------------------------------------------
  // SAVE ALL CHANGES
  // ----------------------------------------------------
  const handleSave = async (overrideConfig?: BookingFormConfig) => {
    setIsSaving(true);
    const configToSave = overrideConfig || config;
    try {
      const res = await fetch("/api/admin/content/booking-form", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: configToSave,
          formats: formats,
        }),
      });
      if (!res.ok) throw new Error("Failed to save booking form configuration");
      const result = await res.json();
      if (result.data?.config) {
        setConfig(result.data.config);
      }
      if (Array.isArray(result.data?.formats)) {
        setFormats(result.data.formats);
      }
      success("Booking form controls published to live website.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save.";
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-xs animate-pulse">
        <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-sans text-[#7B7368]">Loading booking form controls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#705d00] font-semibold uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Interactive Form Controls</span>
          </div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828]">
            Booking Form Controls
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Customize every aspect of the client booking experience: slot availability, day schedules, payment settings, disclosures, and follow-up channels.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/book-a-session#booking-form"
            target="_blank"
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#1A3828]/20 bg-white hover:bg-slate-50 text-[#1A3828] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>Preview Live Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Publish Form Controls"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1A3828]/10 pb-2">
        <button
          onClick={() => setActiveTab("slots")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "slots"
              ? "bg-[#1A3828] text-[#F4D242] shadow-xs"
              : "text-[#7B7368] hover:text-[#1A3828] hover:bg-[#1A3828]/5"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Available Time Slots ({config.timeSlots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("notice")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "notice"
              ? "bg-[#1A3828] text-[#F4D242] shadow-xs"
              : "text-[#7B7368] hover:text-[#1A3828] hover:bg-[#1A3828]/5"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notice Box Banner {config.noticeBox?.enabled ? "(Active)" : "(Off)"}</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "payments"
              ? "bg-[#1A3828] text-[#F4D242] shadow-xs"
              : "text-[#7B7368] hover:text-[#1A3828] hover:bg-[#1A3828]/5"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Settings ({config.enablePayment !== false ? "Enabled" : "Disabled"})</span>
        </button>

        <button
          onClick={() => setActiveTab("text")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "text"
              ? "bg-[#1A3828] text-[#F4D242] shadow-xs"
              : "text-[#7B7368] hover:text-[#1A3828] hover:bg-[#1A3828]/5"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Headlines &amp; Disclosures</span>
        </button>

        <button
          onClick={() => setActiveTab("intake")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "intake"
              ? "bg-[#1A3828] text-[#F4D242] shadow-xs"
              : "text-[#7B7368] hover:text-[#1A3828] hover:bg-[#1A3828]/5"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Channels &amp; WhatsApp Follow-up</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TIME SLOTS & CADENCE                                         */}
      {/* ============================================================ */}
      {activeTab === "slots" && (
        <div className="space-y-6">
          {/* Scheduling Policy Card */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A3828] inline-block"></span>
                  <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                    Client Booking Schedule Mode
                  </h3>
                </div>
                <p className="text-xs text-[#7B7368] mt-1 max-w-xl leading-relaxed">
                  Control whether booking is strictly restricted to dates with an active Day Schedule, or if recurring daily slots are used as a fallback.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.onlyScheduledSlots !== false}
                  onChange={(e) =>
                    setConfig({ ...config, onlyScheduledSlots: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A3828]"></div>
              </label>
            </div>

            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                config.onlyScheduledSlots !== false
                  ? "bg-[#fbf7ee] border-[#705d00]/25 text-[#5a4033]"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <Info className="w-4 h-4 shrink-0 text-[#705d00] mt-0.5" />
              <div>
                {config.onlyScheduledSlots !== false ? (
                  <span>
                    <strong>Only Scheduled Day Slots are displayed:</strong> Clients can only book on dates you configure below in <em>Day Schedule &amp; Leave Management</em>. All other remaining dates and booked slots will display <strong>&ldquo;There is no slot&rdquo;</strong>.
                  </span>
                ) : (
                  <span>
                    <strong>Recurring Daily Slots Active:</strong> The fallback daily slots configured below will be displayed for any date that does not have a day-specific override.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Slots Card (Only visible when Recurring Daily Slots mode is active) */}
          {config.onlyScheduledSlots === false && (
            <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                  Daily Appointment Slots
                </h3>
                <p className="text-xs text-[#7B7368] mt-0.5">
                  These time slots appear in <strong>Step 2</strong> when clients select an available date.
                </p>
              </div>

              {/* Existing Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {config.timeSlots.map((slot, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#f6f3ec] border border-[#e2d9ce]"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#705d00]" />
                      <span className="text-xs font-semibold text-[#412a1e]">{slot.time}</span>
                      {slot.isEvening && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4D242] text-[#221b00] font-semibold">
                          Evening
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(sIdx)}
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Slot Form */}
              <form onSubmit={handleAddSlot} className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#1A3828]/10">
                <input
                  type="text"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  placeholder="e.g. 06:00 PM (Evening Slot) or 09:30 AM"
                  className="w-full sm:w-80 text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                />

                <label className="flex items-center gap-2 text-xs text-[#1A3828] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSlotIsEvening}
                    onChange={(e) => setNewSlotIsEvening(e.target.checked)}
                    className="rounded border-[#1A3828]/20 text-[#1A3828]"
                  />
                  <span>Full-width evening slot?</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#1A3828] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#142C1F] cursor-pointer shadow-xs ml-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slot</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* PARTICULAR DAY SCHEDULE & LEAVE / OFF DAY MANAGEMENT         */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A3828]/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#705d00] inline-block"></span>
                  <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                    Day Schedule &amp; Leave / Off Day Management
                  </h3>
                </div>
                <p className="text-xs text-[#7B7368] mt-0.5">
                  Set custom operating hours for specific dates, or mark dates as <strong>Leave / Off Days</strong> so clients are informed that <strong>no slots are available</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-semibold text-[#705d00] bg-[#fbf7ee] border border-[#705d00]/20 px-2.5 py-1 rounded-full">
                  {(config.singleDaySlots || []).filter((s) => !s.isOffDay).length} custom day{(config.singleDaySlots || []).filter((s) => !s.isOffDay).length === 1 ? "" : "s"}
                </span>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CalendarOff className="w-3 h-3 text-rose-600" />
                  <span>{(config.singleDaySlots || []).filter((s) => s.isOffDay).length} on leave</span>
                </span>
              </div>
            </div>

            {/* Mode Selector Tabs: Working Slots vs Leave / Off Day */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#f6f3ec] border border-[#e2d9ce] w-fit">
              <button
                type="button"
                onClick={() => setDayScheduleMode("slots")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  dayScheduleMode === "slots"
                    ? "bg-[#1A3828] text-white shadow-xs"
                    : "text-[#5a4033] hover:bg-[#eae5dc]"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Working Hours &amp; Slots</span>
              </button>

              <button
                type="button"
                onClick={() => setDayScheduleMode("leave")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  dayScheduleMode === "leave"
                    ? "bg-rose-700 text-white shadow-xs"
                    : "text-rose-700 hover:bg-rose-50 border border-rose-200/60"
                }`}
              >
                <CalendarOff className="w-3.5 h-3.5 text-rose-300" />
                <span>Mark as Leave / Off Day</span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/20 text-white font-bold">
                  No Slots
                </span>
              </button>
            </div>

            {/* MODE 1: WORKING HOURS & CUSTOM SLOTS */}
            {dayScheduleMode === "slots" && (
              <form onSubmit={handleApplyRangeToDay} className="p-5 rounded-2xl bg-[#f6f3ec]/80 border border-[#e2d9ce] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e2d9ce]">
                  <span className="text-xs font-semibold text-[#1A3828] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#705d00]" />
                    <span>Configure Working Hours for a Day</span>
                  </span>

                  <label className="flex items-center gap-2 text-xs text-[#5a4033] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDateRangeMode}
                      onChange={(e) => setIsDateRangeMode(e.target.checked)}
                      className="rounded border-[#1A3828]/20 text-[#1A3828]"
                    />
                    <span>Apply across a Date Range (From Date → To Date)</span>
                  </label>
                </div>

                {/* Row 1: Date(s) & Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A3828] mb-1">
                      {isDateRangeMode ? "Start Date *" : "Particular Day / Date *"}
                    </label>
                    <input
                      type="date"
                      value={particularDate}
                      onChange={(e) => setParticularDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
                      required
                    />
                  </div>

                  {isDateRangeMode && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1A3828] mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={particularEndDate}
                        onChange={(e) => setParticularEndDate(e.target.value)}
                        min={particularDate}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
                        required
                      />
                    </div>
                  )}

                  <div className={isDateRangeMode ? "lg:col-span-1" : "sm:col-span-2"}>
                    <label className="block text-[11px] font-semibold text-[#1A3828] mb-1">
                      Day Schedule Label / Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={rangeNote}
                      onChange={(e) => setRangeNote(e.target.value)}
                      placeholder="e.g. Saturday Extended Clinic, Evening Consultations"
                      className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
                    />
                  </div>
                </div>

                {/* Row 2: Time Range (From ... To ...) & Cadence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A3828] mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#705d00]" />
                      <span>From Time (Start) *</span>
                    </label>
                    <input
                      type="time"
                      value={rangeFromTime}
                      onChange={(e) => setRangeFromTime(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A3828] mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#705d00]" />
                      <span>To Time (End) *</span>
                    </label>
                    <input
                      type="time"
                      value={rangeToTime}
                      onChange={(e) => setRangeToTime(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A3828] mb-1">
                      Session Duration
                    </label>
                    <select
                      value={rangeSlotDuration}
                      onChange={(e) => setRangeSlotDuration(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828] cursor-pointer"
                    >
                      <option value={50}>50 Minutes (Standard)</option>
                      <option value={60}>60 Minutes (1 Hour)</option>
                      <option value={45}>45 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={90}>90 Minutes (Deep Dive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A3828] mb-1">
                      Buffer Between Slots
                    </label>
                    <select
                      value={rangeBuffer}
                      onChange={(e) => setRangeBuffer(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828] cursor-pointer"
                    >
                      <option value={10}>10 Minutes Integration</option>
                      <option value={15}>15 Minutes Buffer</option>
                      <option value={20}>20 Minutes Buffer</option>
                      <option value={0}>0 Minutes (Back to Back)</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Multiple Breaks & Rest Periods Exclusion */}
                <div className="pt-3 border-t border-[#e2d9ce]/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#1A3828] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableBreaks}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setEnableBreaks(val);
                          if (val && breaksList.length === 0) {
                            setBreaksList([
                              { id: "break_1", from: "13:00", to: "14:00", label: "Lunch Break" },
                            ]);
                          }
                        }}
                        className="rounded border-[#1A3828]/20 text-[#1A3828] focus:ring-[#1A3828]"
                      />
                      <span className="flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-[#705d00]" />
                        <span>Exclude Breaks / Rest Periods ({breaksList.length} defined)</span>
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#1A3828] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#142C1F] cursor-pointer shadow-xs sm:ml-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F4D242]" />
                      <span>
                        Apply Range to {isDateRangeMode ? "Date Range" : "Particular Day"}
                      </span>
                    </button>
                  </div>

                  {/* Multiple Breaks Configuration Panel */}
                  {enableBreaks && (
                    <div className="p-4 rounded-xl bg-white border border-[#e2d9ce] space-y-3 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e2d9ce]/60">
                        <div>
                          <span className="text-xs font-bold text-[#1A3828] flex items-center gap-1.5">
                            <Coffee className="w-3.5 h-3.5 text-[#705d00]" />
                            <span>Comfortable Breaks &amp; Unavailability Periods</span>
                          </span>
                          <p className="text-[11px] text-[#7B7368] mt-0.5">
                            Slots overlapping any of these break times will be omitted automatically from booking.
                          </p>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-[#7B7368] font-semibold uppercase tracking-wider">Presets:</span>
                          <button
                            type="button"
                            onClick={() => handleAddBreak({ from: "13:00", to: "14:00", label: "Lunch Break" })}
                            className="text-[10px] font-medium bg-[#f6f3ec] hover:bg-[#ede8df] text-[#412a1e] border border-[#e2d9ce] px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Utensils className="w-2.5 h-2.5 text-[#705d00]" />
                            <span>+ Lunch (1-2 PM)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddBreak({ from: "16:30", to: "17:00", label: "Tea Break" })}
                            className="text-[10px] font-medium bg-[#f6f3ec] hover:bg-[#ede8df] text-[#412a1e] border border-[#e2d9ce] px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Coffee className="w-2.5 h-2.5 text-[#705d00]" />
                            <span>+ Tea (4:30-5 PM)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddBreak({ from: "18:00", to: "18:30", label: "Evening Rest" })}
                            className="text-[10px] font-medium bg-[#f6f3ec] hover:bg-[#ede8df] text-[#412a1e] border border-[#e2d9ce] px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Clock className="w-2.5 h-2.5 text-[#705d00]" />
                            <span>+ Rest (6-6:30 PM)</span>
                          </button>
                        </div>
                      </div>

                      {/* Break Items List */}
                      <div className="space-y-2.5">
                        {breaksList.map((brk, idx) => (
                          <div
                            key={brk.id || idx}
                            className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-2.5 rounded-lg bg-[#fbf9f5] border border-[#e2d9ce]/80 text-xs"
                          >
                            <span className="text-[11px] font-bold text-[#705d00] bg-[#F4D242]/20 px-2 py-1 rounded w-fit">
                              Break {idx + 1}
                            </span>

                            <div className="flex-1">
                              <input
                                type="text"
                                value={brk.label || ""}
                                onChange={(e) => handleUpdateBreak(brk.id, "label", e.target.value)}
                                placeholder="Break Name (e.g. Lunch, Tea Break, Rest)"
                                className="w-full text-xs p-1.5 rounded-lg border border-[#1A3828]/20 bg-white focus:border-[#1A3828] focus:outline-none text-[#1A3828]"
                              />
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-[#7B7368]">From:</span>
                                <input
                                  type="time"
                                  value={brk.from}
                                  onChange={(e) => handleUpdateBreak(brk.id, "from", e.target.value)}
                                  className="text-xs p-1.5 rounded-lg border border-[#1A3828]/20 bg-white focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                                  required
                                />
                              </div>

                              <span className="text-[#7B7368]">to</span>

                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-[#7B7368]">To:</span>
                                <input
                                  type="time"
                                  value={brk.to}
                                  onChange={(e) => handleUpdateBreak(brk.id, "to", e.target.value)}
                                  className="text-xs p-1.5 rounded-lg border border-[#1A3828]/20 bg-white focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                                  required
                                />
                              </div>

                              <span className="text-[10px] text-[#7B7368] font-mono whitespace-nowrap bg-white px-2 py-1 rounded border border-[#e2d9ce] hidden md:inline">
                                {formatMinutesTo12Hour(parseTimeToMinutes(brk.from))} – {formatMinutesTo12Hour(parseTimeToMinutes(brk.to))}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveBreak(brk.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors ml-auto cursor-pointer"
                                title="Delete this break"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddBreak()}
                          className="text-xs font-semibold text-[#1A3828] hover:text-[#142C1F] flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-dashed border-[#1A3828]/30 hover:border-[#1A3828] bg-white transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Another Break</span>
                        </button>

                        <span className="text-[11px] text-[#7B7368]">
                          {breaksList.filter((b) => b.from && b.to).length} active break{breaksList.length === 1 ? "" : "s"} scheduled
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Preview of Generated Slots */}
                <div className="p-3.5 rounded-xl bg-white border border-[#e2d9ce] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#412a1e] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#705d00]" />
                      <span>Live Slots Preview:</span>
                      <span className="text-[#705d00]">
                        From {formatMinutesTo12Hour(parseTimeToMinutes(rangeFromTime))} To {formatMinutesTo12Hour(parseTimeToMinutes(rangeToTime))}
                      </span>
                    </span>
                    <span className="text-[11px] font-semibold text-[#705d00] bg-[#F4D242]/20 px-2 py-0.5 rounded-md">
                      {previewGeneratedSlots.length} slots generated
                    </span>
                  </div>

                  {previewGeneratedSlots.length === 0 ? (
                    <p className="text-xs text-rose-600">
                      No slots could be generated with this time range. Ensure To Time is later than From Time.
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {previewGeneratedSlots.map((slot: BookingTimeSlot, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#f6f3ec] border border-[#e2d9ce] text-[#412a1e] font-medium"
                        >
                          <Clock className="w-3 h-3 text-[#705d00]" />
                          <span>{slot.time}</span>
                          {slot.isEvening && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#F4D242] text-[#221b00] font-semibold">
                              Eve
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* MODE 2: MARK AS LEAVE / OFF DAY (NO SLOTS) */}
            {dayScheduleMode === "leave" && (
              <form onSubmit={handleApplyLeaveToDay} className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                      <CalendarOff className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-rose-900 block">
                        Mark Dates as Leave / Day Off
                      </span>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Selected dates will have <strong>no consultation slots available</strong>. Clients will see that the therapist is on leave.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-[#5a4033] cursor-pointer self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={isDateRangeMode}
                      onChange={(e) => setIsDateRangeMode(e.target.checked)}
                      className="rounded border-rose-300 text-rose-700 focus:ring-rose-500"
                    />
                    <span className="font-medium text-rose-950">Multiple Days Range (From Date → To Date)</span>
                  </label>
                </div>

                {/* Dates Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-950 mb-1">
                      {isDateRangeMode ? "Leave Start Date *" : "Leave Date *"}
                    </label>
                    <input
                      type="date"
                      value={particularDate}
                      onChange={(e) => setParticularDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-rose-300 focus:border-rose-600 focus:outline-none bg-white font-sans text-[#1A3828]"
                      required
                    />
                  </div>

                  {isDateRangeMode && (
                    <div>
                      <label className="block text-[11px] font-semibold text-rose-950 mb-1">
                        Leave End Date *
                      </label>
                      <input
                        type="date"
                        value={particularEndDate}
                        onChange={(e) => setParticularEndDate(e.target.value)}
                        min={particularDate}
                        className="w-full text-xs p-2.5 rounded-xl border border-rose-300 focus:border-rose-600 focus:outline-none bg-white font-sans text-[#1A3828]"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Quick Leave Reason Presets */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-semibold text-rose-950">
                    Leave Reason Presets
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      "Therapist on Leave",
                      "Personal Leave",
                      "Public Holiday",
                      "Vacation / Travel",
                      "Clinic Closed",
                      "Conference / Training",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setLeaveReason(preset);
                          if (!customLeaveNote) setCustomLeaveNote(`${preset} (No consultation slots available)`);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          leaveReason === preset
                            ? "bg-rose-700 text-white font-semibold shadow-xs"
                            : "bg-white text-rose-900 hover:bg-rose-100 border border-rose-200"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-950 mb-1">
                      Reason Label / Title *
                    </label>
                    <input
                      type="text"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="e.g. Annual Leave, Doctor on Leave"
                      className="w-full text-xs p-2.5 rounded-xl border border-rose-300 focus:border-rose-600 focus:outline-none bg-white font-sans text-[#1A3828]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-950 mb-1">
                      Client-Facing Notice (Displayed on Booking Form)
                    </label>
                    <input
                      type="text"
                      value={customLeaveNote}
                      onChange={(e) => setCustomLeaveNote(e.target.value)}
                      placeholder="e.g. Aswathy is on leave on this date. Please pick another date."
                      className="w-full text-xs p-2.5 rounded-xl border border-rose-300 focus:border-rose-600 focus:outline-none bg-white font-sans text-[#1A3828]"
                    />
                  </div>
                </div>

                {/* Submit button for Leave */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-rose-800 font-medium">
                    {particularDate
                      ? isDateRangeMode && particularEndDate
                        ? `Will mark range ${particularDate} → ${particularEndDate} as on leave.`
                        : `Will mark ${particularDate} as on leave.`
                      : "Select date above to proceed."}
                  </span>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <CalendarOff className="w-3.5 h-3.5 text-rose-200" />
                    <span>
                      Mark {isDateRangeMode ? "Date Range" : "Day"} as On Leave (No Slots)
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* List of Configured Days (Both Working Custom Days & Leave Days) */}
            {(!config.singleDaySlots || config.singleDaySlots.length === 0) ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-[#1A3828]/20 text-[#7B7368] text-xs space-y-1">
                <Calendar className="w-6 h-6 mx-auto text-[#7B7368]/50" />
                <p className="font-medium text-[#1A3828]">No custom day schedules or leaves configured</p>
                <p>Standard daily slots apply to all open calendar dates. You can customize hours or mark leaves above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#7B7368] pb-1">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-[#1A3828]">
                    Configured Days &amp; Leaves ({config.singleDaySlots.length})
                  </span>
                  <span>Click delete or toggle to update any day</span>
                </div>

                {config.singleDaySlots.map((dayOverride) => {
                  const dateObj = new Date(dayOverride.date + "T00:00:00");
                  const formattedDate = dateObj.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  // LEAVE / OFF DAY CARD
                  if (dayOverride.isOffDay || (Array.isArray(dayOverride.slots) && dayOverride.slots.length === 0)) {
                    return (
                      <div
                        key={dayOverride.date}
                        className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CalendarOff className="w-4 h-4 text-rose-600" />
                            <span className="text-xs font-bold text-rose-950 font-sans">
                              {formattedDate}
                            </span>
                            <span className="text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 font-mono">
                              {dayOverride.date}
                            </span>
                            <span className="text-[10px] font-bold text-white bg-rose-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <Ban className="w-2.5 h-2.5" />
                              <span>On Leave · No Slots</span>
                            </span>
                            {(dayOverride.leaveReason || dayOverride.note) && (
                              <span className="text-[11px] font-medium text-rose-800 bg-white/80 border border-rose-200 px-2.5 py-0.5 rounded-md">
                                {dayOverride.leaveReason || dayOverride.note}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-rose-800 italic">
                            Client Notice: &ldquo;{dayOverride.note || "Therapist is on leave. No slots are available for this date."}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleToggleDayOff(dayOverride.date)}
                            className="text-xs text-[#1A3828] hover:bg-[#1A3828]/10 border border-[#1A3828]/30 px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1 cursor-pointer bg-white"
                            title="Switch back to active working day"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#705d00]" />
                            <span>Set as Working Day</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSingleDayOverride(dayOverride.date)}
                            className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-100 border border-rose-300 px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1 cursor-pointer bg-white"
                            title="Remove leave"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // ACTIVE WORKING DAY WITH CUSTOM SLOTS
                  return (
                    <div
                      key={dayOverride.date}
                      className="p-4 rounded-xl bg-[#f6f3ec]/60 border border-[#e2d9ce] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#705d00]" />
                          <span className="text-xs font-semibold text-[#412a1e] font-sans">
                            {formattedDate}
                          </span>
                          <span className="text-[10px] text-[#7B7368] bg-white/80 px-2 py-0.5 rounded-md border border-[#e2d9ce]">
                            {dayOverride.date}
                          </span>
                          {dayOverride.fromTime && dayOverride.toTime && (
                            <span className="text-[10px] font-semibold text-[#1A3828] bg-[#1A3828]/10 px-2 py-0.5 rounded-md">
                              Range: {dayOverride.fromTime} → {dayOverride.toTime}
                            </span>
                          )}
                          {dayOverride.note && (
                            <span className="text-[10px] font-semibold text-[#705d00] bg-[#F4D242]/30 px-2 py-0.5 rounded-full">
                              {dayOverride.note}
                            </span>
                          )}
                          {dayOverride.breaks && dayOverride.breaks.length > 0 && (
                            <span className="text-[10px] font-medium text-[#705d00] bg-[#fbf7ee] border border-[#705d00]/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Coffee className="w-2.5 h-2.5" />
                              <span>{dayOverride.breaks.length} break{dayOverride.breaks.length === 1 ? "" : "s"} excluded</span>
                            </span>
                          )}
                        </div>

                        {/* List breaks if any */}
                        {dayOverride.breaks && dayOverride.breaks.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-semibold text-[#7B7368] flex items-center gap-1">
                              <Coffee className="w-3 h-3 text-[#705d00]" />
                              <span>Breaks:</span>
                            </span>
                            {dayOverride.breaks.map((b, bIdx) => (
                              <span
                                key={bIdx}
                                className="text-[10px] font-medium bg-white text-[#5a4033] border border-[#e2d9ce] px-2 py-0.5 rounded-md"
                              >
                                {b.label ? `${b.label}: ` : ""}
                                {formatMinutesTo12Hour(parseTimeToMinutes(b.from))} – {formatMinutesTo12Hour(parseTimeToMinutes(b.to))}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Slots for this day */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {dayOverride.slots.map((slot, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-[#e2d9ce] text-[#412a1e] shadow-xs"
                            >
                              <Clock className="w-3 h-3 text-[#705d00]" />
                              <span>{slot.time}</span>
                              {slot.isEvening && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-[#F4D242] text-[#221b00] font-semibold">
                                  Eve
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveSingleDaySlot(dayOverride.date, sIdx)}
                                className="text-rose-500 hover:text-rose-700 ml-1 cursor-pointer font-bold"
                                title="Remove this slot"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleToggleDayOff(dayOverride.date)}
                          className="text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1 cursor-pointer bg-white"
                          title="Change this day to Leave"
                        >
                          <CalendarOff className="w-3.5 h-3.5 text-rose-600" />
                          <span>Mark as Leave</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSingleDayOverride(dayOverride.date)}
                          className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1 cursor-pointer bg-white"
                          title="Delete entire day schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cadence Notice Settings */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                Cadence &amp; Integration Buffer Disclosure
              </h3>
              <p className="text-xs text-[#7B7368] mt-0.5">
                Reassure clients about unhurried sessions and nervous system integration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Cadence Title
                </label>
                <input
                  type="text"
                  value={config.cadenceTitle}
                  onChange={(e) => setConfig({ ...config, cadenceTitle: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Timezone Display Tag
                </label>
                <input
                  type="text"
                  value={config.timezone}
                  onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Cadence Explanation
              </label>
              <textarea
                rows={2}
                value={config.cadenceDescription}
                onChange={(e) => setConfig({ ...config, cadenceDescription: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans leading-relaxed resize-none text-[#1A3828]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: NOTICE BOX BANNER (ANNOUNCEMENTS & CLINIC UPDATES)      */}
      {/* ============================================================ */}
      {activeTab === "notice" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A3828]/10 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                    Booking Form Notice Box
                  </h3>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                      config.noticeBox?.enabled
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-slate-100 text-slate-600 border border-slate-300"
                    }`}
                  >
                    {config.noticeBox?.enabled ? "● Active on Website" : "○ Turned Off"}
                  </span>
                </div>
                <p className="text-xs text-[#7B7368] mt-1">
                  Display an announcement, clinic holiday update, policy note, or special instructions directly at the top of the booking form.
                </p>
              </div>

              {/* Master Toggle */}
              <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto bg-[#f6f3ec] px-4 py-2.5 rounded-xl border border-[#e2d9ce] hover:bg-[#ece8df] transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={Boolean(config.noticeBox?.enabled)}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      noticeBox: {
                        enabled: e.target.checked,
                        title: config.noticeBox?.title || "Important Clinic Notice",
                        message: config.noticeBox?.message || "",
                        type: config.noticeBox?.type || "announcement",
                      },
                    })
                  }
                  className="w-4 h-4 text-[#1A3828] rounded border-gray-300 focus:ring-[#1A3828] cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#1A3828]">
                  Enable Notice Box on Booking Form
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Form Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1.5">
                    Notice Banner Style &amp; Theme
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { type: "announcement", label: "Announcement", desc: "Warm Sunlit Gold" },
                      { type: "info", label: "Information", desc: "Calm Sky Blue" },
                      { type: "warning", label: "Important Alert", desc: "Soft Amber" },
                      { type: "success", label: "Friendly Note", desc: "Gentle Sage Green" },
                    ].map((style) => (
                      <button
                        key={style.type}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            noticeBox: {
                              enabled: config.noticeBox?.enabled ?? true,
                              title: config.noticeBox?.title || "Important Clinic Notice",
                              message: config.noticeBox?.message || "",
                              type: style.type as "info" | "warning" | "announcement" | "success",
                            },
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          (config.noticeBox?.type || "announcement") === style.type
                            ? "border-[#1A3828] bg-[#1A3828]/5 ring-1 ring-[#1A3828]"
                            : "border-[#e2d9ce] bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-xs font-semibold text-[#1A3828]">
                          {style.label}
                        </span>
                        <span className="block text-[10px] text-[#7B7368] mt-0.5">
                          {style.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Notice Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. In-Person Consultations & Holiday Schedule"
                    value={config.noticeBox?.title || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        noticeBox: {
                          enabled: config.noticeBox?.enabled ?? true,
                          title: e.target.value,
                          message: config.noticeBox?.message || "",
                          type: config.noticeBox?.type || "announcement",
                        },
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Notice Content / Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write the message or instructions clients should read before booking (supports multiple lines)..."
                    value={config.noticeBox?.message || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        noticeBox: {
                          enabled: config.noticeBox?.enabled ?? true,
                          title: config.noticeBox?.title || "",
                          message: e.target.value,
                          type: config.noticeBox?.type || "announcement",
                        },
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828] leading-relaxed"
                  />
                  <p className="text-[11px] text-[#7B7368] mt-1">
                    Paragraphs and line breaks are preserved cleanly on the client form.
                  </p>
                </div>

                {/* Quick Templates */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#7B7368] uppercase tracking-wider mb-2">
                    Quick Preset Templates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          noticeBox: {
                            enabled: true,
                            type: "announcement",
                            title: "100% Online Telehealth Appointments",
                            message: "All sessions are currently hosted safely online via encrypted Google Meet links. If you require special accommodations, feel free to mention them in your confidential notes.",
                          },
                        })
                      }
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-[#e2d9ce] bg-[#f6f3ec] text-[#412a1e] hover:bg-[#ece8df] cursor-pointer"
                    >
                      Telehealth Note
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          noticeBox: {
                            enabled: true,
                            type: "warning",
                            title: "Holiday Schedule Notice",
                            message: "The practice will be operating on adjusted hours this upcoming week. Slots shown on the calendar represent current real-time availability.",
                          },
                        })
                      }
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-[#e2d9ce] bg-[#f6f3ec] text-[#412a1e] hover:bg-[#ece8df] cursor-pointer"
                    >
                      Holiday Hours
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          noticeBox: {
                            enabled: true,
                            type: "info",
                            title: "First-Time Clients Welcome",
                            message: "If this is your first therapy consultation, there is no need to prepare anything beforehand. We move at your unhurried pace.",
                          },
                        })
                      }
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-[#e2d9ce] bg-[#f6f3ec] text-[#412a1e] hover:bg-[#ece8df] cursor-pointer"
                    >
                      First-Time Clients
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Client Preview */}
              <div className="bg-[#f6f3ec] rounded-2xl p-5 border border-[#e2d9ce] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-[#705d00]" />
                    <span className="text-xs font-semibold text-[#412a1e] uppercase tracking-wider">
                      Live Client Preview
                    </span>
                  </div>

                  {config.noticeBox?.enabled ? (
                    <div
                      className={`rounded-2xl p-4 border shadow-2xs transition-all ${
                        config.noticeBox?.type === "warning"
                          ? "bg-[#fff7ed] border-[#fed7aa] text-[#7c2d12]"
                          : config.noticeBox?.type === "info"
                          ? "bg-[#eff6ff] border-[#bfdbfe] text-[#1e3a8a]"
                          : config.noticeBox?.type === "success"
                          ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#14532d]"
                          : "bg-[#fdf9e8] border-[#fde68a] text-[#78350f]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            config.noticeBox?.type === "warning"
                              ? "bg-[#ffedd5] text-[#c2410c]"
                              : config.noticeBox?.type === "info"
                              ? "bg-[#dbeafe] text-[#2563eb]"
                              : config.noticeBox?.type === "success"
                              ? "bg-[#dcfce7] text-[#16a34a]"
                              : "bg-[#fef3c7] text-[#b45309]"
                          }`}
                        >
                          {config.noticeBox?.type === "warning" ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : config.noticeBox?.type === "info" ? (
                            <Info className="w-4 h-4" />
                          ) : config.noticeBox?.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Megaphone className="w-4 h-4" />
                          )}
                        </div>
                        <div className="space-y-1.5 w-full">
                          <h4 className="text-sm font-semibold tracking-tight">
                            {config.noticeBox?.title || "Notice Title Here"}
                          </h4>
                          {(() => {
                            const rawMsg = config.noticeBox?.message || "";
                            const lines = rawMsg.split("\n").map((l) => l.trim()).filter(Boolean);
                            const hasNumbered = lines.some((l) => /^\d+[\.\)]/.test(l));
                            if (hasNumbered && lines.length > 1) {
                              return (
                                <div className="space-y-1.5 pt-1">
                                  {lines.map((l, i) => {
                                    const match = l.match(/^(\d+)[\.\)]\s*(.*)$/);
                                    const num = match ? match[1] : String(i + 1);
                                    const text = match ? match[2] : l;
                                    return (
                                      <div
                                        key={i}
                                        className="flex items-start gap-2 p-2 rounded-lg bg-white/80 border border-black/5 text-xs"
                                      >
                                        <span className="w-5 h-5 rounded-full bg-black/5 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                          {num}
                                        </span>
                                        <span className="leading-relaxed">{text}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return (
                              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line opacity-95">
                                {rawMsg || "Your notice message will appear here for clients visiting the booking form."}
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-[#e2d9ce] rounded-2xl bg-white/60">
                      <Megaphone className="w-8 h-8 text-[#82746f]/40 mx-auto mb-2" />
                      <p className="text-xs text-[#82746f] font-medium">
                        Notice box is currently turned off. Toggle the switch above to activate it.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#e2d9ce] text-[11px] text-[#82746f]">
                  💡 <em>Remember to click <strong>&quot;Publish Form Controls&quot;</strong> in the top-right corner to save and publish your notice to the live booking form.</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: PAYMENT SETTINGS (ENABLE / DISABLE PAYMENTS)            */}
      {/* ============================================================ */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A3828]/10">
            <div>
              <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                Online Payment Collection Settings
              </h3>
              <p className="text-xs text-[#7B7368] mt-0.5">
                Toggle whether clients must pay online via Razorpay to confirm their booking, or allow direct booking with payment settled later.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  config.enablePayment !== false
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {config.enablePayment !== false
                  ? "● Razorpay Online Payments Active"
                  : "○ Direct Booking (Pay Later) Active"}
              </span>
            </div>
          </div>

          {/* Master Toggle Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              config.enablePayment !== false
                ? "bg-emerald-50/50 border-emerald-200"
                : "bg-amber-50/40 border-amber-200"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    config.enablePayment !== false
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A3828]">
                    Require Online Payment via Razorpay
                  </h4>
                  <p className="text-xs text-[#5a4033] mt-1 leading-relaxed">
                    {config.enablePayment !== false
                      ? "Enabled: Clients are required to complete online payment (cards, UPI, netbanking) through Razorpay before their appointment is booked."
                      : "Disabled: Online checkout is skipped. Clients book their session immediately and can settle fees directly at the clinic, via personal UPI, or after consultation."}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={config.enablePayment !== false}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    const updated = {
                      ...config,
                      enablePayment: enabled,
                      submitButtonText: enabled
                        ? "Pay via Razorpay & Book Session"
                        : "Confirm & Book Session (Pay Later)",
                    };
                    setConfig(updated);
                    handleSave(updated);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A3828]"></div>
              </label>
            </div>
          </div>

          {/* Pay Later Client Guidance Note */}
          <div className="space-y-4 pt-2">
            {/* When payment is disabled, show manual payment status controls */}
            {config.enablePayment === false && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-4">
                <h5 className="text-xs font-semibold text-[#1A3828] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#705d00]" />
                  <span>Manual Payment Status Configuration</span>
                </h5>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Default Payment Status for New Bookings
                  </label>
                  <select
                    value={config.defaultPaymentStatus || "pending"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        defaultPaymentStatus: e.target.value as "pending" | "paid",
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828] cursor-pointer"
                  >
                    <option value="pending">Pending (Pay Later / Settle at Clinic / Cash / UPI)</option>
                    <option value="paid">Paid (Marked as Paid Automatically)</option>
                  </select>
                  <p className="text-[11px] text-[#7B7368] mt-1">
                    When set to Pending, bookings will show as unpaid until you manually mark them as Paid in the Admin Bookings page.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Manual Payment Instructions (Cash / UPI / Reception)
                  </label>
                  <textarea
                    rows={2}
                    value={
                      config.manualPaymentInstructions ??
                      "You can settle your session fee directly via Cash or UPI (Google Pay, PhonePe, Paytm) upon arrival at the clinic or during your consultation."
                    }
                    onChange={(e) =>
                      setConfig({ ...config, manualPaymentInstructions: e.target.value })
                    }
                    placeholder="Instructions for client on how to pay manually..."
                    className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans leading-relaxed resize-none text-[#1A3828]"
                  />
                  <p className="text-[11px] text-[#7B7368] mt-1">
                    Shown to clients during booking so they know the exact offline payment procedure.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Client Notice When Online Payment is Disabled
              </label>
              <textarea
                rows={2}
                value={
                  config.paymentDisabledNote ||
                  "No upfront payment required online. You may settle your consultation fee directly at the clinic or after your session."
                }
                onChange={(e) =>
                  setConfig({ ...config, paymentDisabledNote: e.target.value })
                }
                placeholder="Message displayed to clients explaining how/when payment will be handled..."
                className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans leading-relaxed resize-none text-[#1A3828]"
              />
              <p className="text-[11px] text-[#7B7368] mt-1">
                This notice is shown to clients in Step 3 when online payments are turned off.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Submit Button Label
              </label>
              <input
                type="text"
                value={
                  config.submitButtonText ||
                  (config.enablePayment !== false
                    ? "Pay via Razorpay & Book Session"
                    : "Confirm & Book Session (Pay Later)")
                }
                onChange={(e) =>
                  setConfig({ ...config, submitButtonText: e.target.value })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
              />
              <p className="text-[11px] text-[#7B7368] mt-1">
                The call-to-action text on the final booking button.
              </p>
            </div>

            {/* Dedicated in-tab Save button */}
            <div className="pt-4 border-t border-[#1A3828]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#7B7368]">
                Changes to payment mode, instructions, and notes publish directly to the live website.
              </span>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Publishing..." : "Save Payment Settings"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: HEADLINES & DISCLOSURES                               */}
      {/* ============================================================ */}
      {activeTab === "text" && (
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
              Headlines, Step Titles &amp; Security Badges
            </h3>
            <p className="text-xs text-[#7B7368] mt-0.5">
              Refine the reassuring voice and terminology used across the booking form.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Top Sanctuary Badge
              </label>
              <input
                type="text"
                value={config.headerBadge}
                onChange={(e) => setConfig({ ...config, headerBadge: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Top Right Security Badge
              </label>
              <input
                type="text"
                value={config.securityBadge}
                onChange={(e) => setConfig({ ...config, securityBadge: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Main Form Headline
              </label>
              <input
                type="text"
                value={config.headerTitle}
                onChange={(e) => setConfig({ ...config, headerTitle: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans font-semibold text-[#1A3828]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Step 1 Title
              </label>
              <input
                type="text"
                value={config.step1Title}
                onChange={(e) => setConfig({ ...config, step1Title: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Step 2 Title
              </label>
              <input
                type="text"
                value={config.step2Title}
                onChange={(e) => setConfig({ ...config, step2Title: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Step 3 Title
              </label>
              <input
                type="text"
                value={config.step3Title}
                onChange={(e) => setConfig({ ...config, step3Title: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Submit Action Button Text
              </label>
              <input
                type="text"
                value={config.submitButtonText}
                onChange={(e) => setConfig({ ...config, submitButtonText: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans font-semibold text-[#1A3828]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Instant Confirmation Note (Bottom Bar)
              </label>
              <input
                type="text"
                value={config.instantConfirmationText}
                onChange={(e) => setConfig({ ...config, instantConfirmationText: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: INTAKE CHANNELS, ETHICS & WHATSAPP                    */}
      {/* ============================================================ */}
      {activeTab === "intake" && (
        <div className="space-y-6">
          {/* Preferred Contact Channels */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                Preferred Contact Channels
              </h3>
              <p className="text-xs text-[#7B7368] mt-0.5">
                Options presented in the &quot;Preferred Contact Channel&quot; dropdown in Step 3.
              </p>
            </div>

            <div className="space-y-2">
              {config.contactChannels.map((channel, cIdx) => (
                <div
                  key={cIdx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#f6f3ec] border border-[#e2d9ce]"
                >
                  <span className="text-xs font-medium text-[#412a1e]">{channel}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteChannel(cIdx)}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddChannel} className="flex items-center gap-3 pt-3 border-t border-[#1A3828]/10">
              <input
                type="text"
                value={newChannelText}
                onChange={(e) => setNewChannelText(e.target.value)}
                placeholder="e.g. Signal Encrypted Call"
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#1A3828] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#142C1F] cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Channel</span>
              </button>
            </form>
          </div>

          {/* Ethics & WhatsApp */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                Ethics Statement &amp; Practitioner WhatsApp
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Psychological Ethics Statement
              </label>
              <textarea
                rows={2}
                value={config.ethicsNotice}
                onChange={(e) => setConfig({ ...config, ethicsNotice: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans leading-relaxed resize-none text-[#1A3828]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Practitioner WhatsApp Number (with country code)
                </label>
                <input
                  type="text"
                  value={config.whatsappNumber}
                  onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                  placeholder="+91 755 000 2973"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Confirmation Screen Title
                </label>
                <input
                  type="text"
                  value={config.confirmationTitle}
                  onChange={(e) => setConfig({ ...config, confirmationTitle: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
