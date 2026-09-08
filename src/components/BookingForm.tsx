"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Video,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  CalendarPlus,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { BookingFormConfig } from "@/lib/booking-config";
import { DEFAULT_BOOKING_FORM_CONFIG, DEFAULT_SESSION_FORMATS, SessionFormat } from "@/lib/booking-config";
import type { Service, ServiceCategory } from "@/lib/types";

const SESSION_FORMATS: SessionFormat[] = DEFAULT_SESSION_FORMATS;

const DEFAULT_SERVICES: Service[] = [
  {
    id: "svc_emotional_wellbeing",
    name: "Emotional Wellbeing & Stress Management",
    categoryId: "cat_emotional",
    categoryName: "Emotional Wellbeing",
    shortDescription: "Navigating chronic anxiety, mood swings, somatic fatigue, and inner dialogue without harsh suppression.",
    fullDescription: "Emotional distress often signals unacknowledged needs. In this collaborative space, we gently explore physical sensations, emotional triggers, and personalized somatic grounding techniques at your pace.",
    durationMinutes: 50,
    price: 1800,
    image: "",
    status: "active",
    order: 1,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "svc_personal_concerns",
    name: "Personal Concerns & Self-Compassion",
    categoryId: "cat_personal",
    categoryName: "Personal Growth",
    shortDescription: "Untangling perfectionism, imposter syndrome, decision paralysis, and self-esteem dread.",
    fullDescription: "Therapy provides an unhurried mirror to untangle who you are from who you were told you needed to be. Focus on gentle internal validation and healthy boundary development.",
    durationMinutes: 50,
    price: 1800,
    image: "",
    status: "active",
    order: 2,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "svc_relationships",
    name: "Relationships & Interpersonal Dynamics",
    categoryId: "cat_relationship",
    categoryName: "Relationship & Interpersonal",
    shortDescription: "Cultivating secure attachment, boundary articulation, conflict repair, and relational presence.",
    fullDescription: "Relationships mirror our deepest attachments and vulnerabilities. We explore relational communication, unmet relational needs, and conscious relational choices.",
    durationMinutes: 50,
    price: 1800,
    image: "",
    status: "active",
    order: 3,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "svc_transitions",
    name: "Life Transitions & Identity Shifts",
    categoryId: "cat_transitions",
    categoryName: "Life Transitions",
    shortDescription: "Support through career shifts, geographic relocations, bereavement, and redefining life purpose.",
    fullDescription: "Transitions dissolve familiar footing. Together we create an anchoring sanctuary to process ambiguity, honor grief, and re-author your path forward.",
    durationMinutes: 50,
    price: 1800,
    image: "",
    status: "active",
    order: 4,
    createdAt: "",
    updatedAt: "",
  },
];

const TIME_SLOTS = [
  { time: "10:00 AM", isEvening: false },
  { time: "11:30 AM", isEvening: false },
  { time: "02:00 PM", isEvening: false },
  { time: "04:00 PM", isEvening: false },
  { time: "05:30 PM (Evening Slot)", isEvening: true },
];

const CONTACT_CHANNELS = [
  "Email Invitation & Encrypted Link",
  "WhatsApp & Email Notification",
  "Direct Phone Call",
];

interface BookingFormProps {
  initialFormatId?: string;
  initialServiceId?: string;
  className?: string;
}

export default function BookingForm({
  initialFormatId = "individual-online",
  initialServiceId,
  className = "",
}: BookingFormProps) {
  const [config, setConfig] = useState<BookingFormConfig>(DEFAULT_BOOKING_FORM_CONFIG);
  const [formatsList, setFormatsList] = useState<SessionFormat[]>(SESSION_FORMATS);
  const [selectedFormat, setSelectedFormat] = useState<SessionFormat>(
    SESSION_FORMATS.find((f) => f.id === initialFormatId) || SESSION_FORMATS[0]
  );

  // Live Clinical Services & Categories state
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<Service>(DEFAULT_SERVICES[0]);
  const selectedModality = "online";

  // Fetch dynamic session formats and form configuration from admin
  useEffect(() => {
    async function loadLiveConfig() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) return;
        const data = await res.json();
        if (data.bookingFormConfig) {
          setConfig(data.bookingFormConfig);
          if (Array.isArray(data.bookingFormConfig.timeSlots) && data.bookingFormConfig.timeSlots.length > 0) {
            setSelectedTime(data.bookingFormConfig.timeSlots[0].time);
          }
          if (Array.isArray(data.bookingFormConfig.contactChannels) && data.bookingFormConfig.contactChannels.length > 0) {
            setContactChannel(data.bookingFormConfig.contactChannels[0]);
          }
        }
        if (Array.isArray(data.sessionFormats) && data.sessionFormats.length > 0) {
          setFormatsList(data.sessionFormats);
          setSelectedFormat((prev) => {
            const match = data.sessionFormats.find((f: SessionFormat) => f.id === prev.id);
            return match || data.sessionFormats[0];
          });
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadLiveConfig();
  }, []);

  // Fetch live clinical services & categories
  useEffect(() => {
    async function loadLiveServices() {
      try {
        const res = await fetch("/api/services");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
          setSelectedService((prev) => {
            if (initialServiceId) {
              const byProp = data.services.find((s: Service) => s.id === initialServiceId);
              if (byProp) return byProp;
            }
            const matched = data.services.find((s: Service) => s.id === prev.id);
            return matched || data.services[0];
          });
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadLiveServices();
  }, [initialServiceId]);

  // Read URL search params safely for pre-selection (e.g. ?service=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const svcParam = params.get("service") || params.get("serviceId");
      if (svcParam && services.length > 0) {
        const found = services.find(
          (s) =>
            s.id.toLowerCase() === svcParam.toLowerCase() ||
            s.name.toLowerCase().includes(svcParam.toLowerCase())
        );
        if (found) {
          setSelectedService(found);
          setSelectedCategory(found.categoryId);
        }
      }
    }
  }, [services]);

  // Filtered services based on selected category pill
  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter((s) => s.categoryId === selectedCategory);
  }, [services, selectedCategory]);

  // Calendar navigation state
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Selected date defaults to tomorrow
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  const [selectedTime, setSelectedTime] = useState<string>("11:30 AM");

  // Client Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactChannel, setContactChannel] = useState(CONTACT_CHANNELS[0]);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    format: string;
    serviceName: string;
    categoryName?: string;
    price?: number;
    durationMinutes?: number;
    date: string;
    time: string;
    clientName: string;
    clientEmail: string;
  } | null>(null);

  // Generate calendar days for current view month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const totalDays = lastDay.getDate();
    // Monday = 0 ... Sunday = 6
    const firstDayIndex = (firstDay.getDay() + 6) % 7;

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevDays.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    const currentDays = [];
    for (let i = 1; i <= totalDays; i++) {
      currentDays.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const filledTotal = prevDays.length + currentDays.length;
    const nextDaysNeeded = (7 - (filledTotal % 7)) % 7;
    const nextDays = [];
    for (let i = 1; i <= nextDaysNeeded; i++) {
      nextDays.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isSameDate = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isPastDate = (d: Date) => {
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return targetMidnight < todayMidnight;
  };

  // Local date formatted as YYYY-MM-DD
  const selectedDateStr = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  // Check if current date has single-day specific slot times configured by admin
  const activeSingleDayOverride = useMemo(() => {
    if (!config.singleDaySlots || !Array.isArray(config.singleDaySlots)) return null;
    return config.singleDaySlots.find((s) => s.date === selectedDateStr) || null;
  }, [config.singleDaySlots, selectedDateStr]);

  // Active time slots (single day override slots take precedence over daily default slots)
  const activeTimeSlots = useMemo(() => {
    if (activeSingleDayOverride && activeSingleDayOverride.slots && activeSingleDayOverride.slots.length > 0) {
      return activeSingleDayOverride.slots;
    }
    return config.timeSlots || TIME_SLOTS;
  }, [activeSingleDayOverride, config.timeSlots]);

  // Automatically keep selectedTime pointing to a valid slot when date changes
  useEffect(() => {
    if (activeTimeSlots.length > 0) {
      const isValid = activeTimeSlots.some((s) => s.time === selectedTime);
      if (!isValid) {
        setSelectedTime(activeTimeSlots[0].time);
      }
    }
  }, [activeTimeSlots, selectedTime]);

  // Formatted date string for the time slot header
  const formattedSelectedDateHeader = useMemo(() => {
    const weekday = selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const month = selectedDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const day = selectedDate.getDate();
    return `AVAILABLE FOR ${weekday}, ${month} ${day}`;
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }
    if (!selectedTime) {
      setErrorMessage("Please choose an available appointment time.");
      return;
    }

    setIsSubmitting(true);

    const formattedIsoDate = selectedDateStr;

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: fullName.trim(),
          clientEmail: email.trim().toLowerCase(),
          clientPhone: phone.trim() || undefined,
          serviceName: selectedService?.name || "Clinical Consultation",
          serviceId: selectedService?.id || "svc_emotional_wellbeing",
          format: "online",
          price: selectedService?.price || 1800,
          durationMinutes: selectedService?.durationMinutes || 50,
          appointmentDate: formattedIsoDate,
          appointmentTime: selectedTime,
          clientMessage: notes.trim() || undefined,
          contactChannel: contactChannel,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create booking.");
      }

      const confirmed = {
        id: data.booking?.id || `ASW-${Math.floor(100000 + Math.random() * 900000)}`,
        format: "online",
        serviceName: selectedService?.name || "Clinical Consultation",
        categoryName: selectedService?.categoryName || "Therapy",
        price: selectedService?.price || 1800,
        durationMinutes: selectedService?.durationMinutes || 50,
        date: formattedIsoDate,
        time: selectedTime,
        clientName: fullName,
        clientEmail: email,
      };

      setConfirmedBooking(confirmed);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#705d00", "#F4D242", "#412a1e", "#ffdbc8"],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!confirmedBooking) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aswathy Counselling Psychology//Consultation//EN
BEGIN:VEVENT
UID:${confirmedBooking.id}@aswathycounselling.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${confirmedBooking.date.replace(/-/g, "")}T100000Z
SUMMARY:${confirmedBooking.serviceName} - Aswathy Counselling
DESCRIPTION:Confidential consultation with Aswathy Jeyarajasekar.\\nBooking Reference: ${confirmedBooking.id}\\nFormat: ${confirmedBooking.format.toUpperCase()}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Aswathy-Consultation-${confirmedBooking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppChat = () => {
    if (!confirmedBooking) return;
    const msg = encodeURIComponent(
      `Hello Aswathy, I have scheduled an appointment for ${confirmedBooking.serviceName} on ${confirmedBooking.date} at ${confirmedBooking.time} (Booking ID: ${confirmedBooking.id}). Looking forward to connecting.`
    );
    const cleanPhone = (config.whatsappNumber || "+919876543210").replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const resetForm = () => {
    setConfirmedBooking(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setErrorMessage("");
  };

  // ----------------------------------------------------
  // CONFIRMATION VIEW
  // ----------------------------------------------------
  if (confirmedBooking) {
    return (
      <div
        className={`w-full max-w-5xl mx-auto rounded-3xl bg-[#fcf9f2] border border-[#e2d9ce] p-6 sm:p-10 shadow-[0_8px_40px_rgba(65,42,30,0.06)] animate-fadeIn ${className}`}
      >
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F4D242]/20 border border-[#F4D242] text-[#412a1e] flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8 text-[#705d00]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#705d00] bg-[#F4D242]/20 px-3 py-1 rounded-full inline-block">
              Appointment Secured
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#412a1e] font-normal tracking-tight">
              Your Sanctuary Awaits
            </h3>
            <p className="text-sm text-[#4f443f] max-w-md mx-auto">
              A confidential confirmation email has been sent to{" "}
              <strong className="text-[#412a1e] font-medium">{confirmedBooking.clientEmail}</strong>.
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-[#f6f3ec] rounded-2xl p-6 border border-[#e2d9ce] text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2d9ce]/70 pb-3">
              <span className="text-xs uppercase tracking-wider text-[#82746f] font-medium">
                Booking Reference
              </span>
              <span className="font-mono text-sm font-semibold text-[#412a1e] bg-[#e5e2db] px-2.5 py-0.5 rounded">
                #{confirmedBooking.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[#82746f] block">Service</span>
                <span className="font-medium text-[#412a1e]">{confirmedBooking.serviceName}</span>
                {confirmedBooking.categoryName && (
                  <span className="text-[11px] text-[#705d00] font-medium block">
                    {confirmedBooking.categoryName}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs text-[#82746f] block">Modality</span>
                <span className="font-medium text-[#412a1e]">
                  100% Online Telehealth (Google Meet)
                </span>
                {confirmedBooking.price && (
                  <span className="text-[11px] text-[#82746f] block">
                    ₹{confirmedBooking.price.toLocaleString("en-IN")} · {confirmedBooking.durationMinutes || 50} mins
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs text-[#82746f] block">Date</span>
                <span className="font-medium text-[#412a1e]">{confirmedBooking.date}</span>
              </div>
              <div>
                <span className="text-xs text-[#82746f] block">Time</span>
                <span className="font-medium text-[#412a1e]">{confirmedBooking.time} IST</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleDownloadIcs}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#412a1e] text-[#fcf9f2] text-sm font-medium hover:bg-[#5a4033] transition-colors cursor-pointer shadow-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Add to Calendar</span>
            </button>

            <button
              onClick={handleWhatsAppChat}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#e8efea] text-[#1a3828] text-sm font-medium hover:bg-[#d5e4d9] transition-colors cursor-pointer border border-[#c2d6c9]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Connect via WhatsApp</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#e2d9ce]/60">
            <button
              onClick={resetForm}
              className="text-xs text-[#82746f] hover:text-[#412a1e] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Schedule another appointment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN INLINE BOOKING FORM
  // ----------------------------------------------------
  return (
    <div
      className={`w-full max-w-5xl mx-auto rounded-3xl bg-[#fcf9f2] border border-[#e2d9ce] p-6 sm:p-10 lg:p-12 shadow-[0_8px_40px_rgba(65,42,30,0.06)] text-[#1c1c18] ${className}`}
    >
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#e2d9ce]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#705d00] block mb-1">
            {config.headerBadge || "Live Scheduling Sanctuary"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#412a1e] font-normal tracking-tight">
            {config.headerTitle || "Select your consultation preference"}
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f6f3ec] border border-[#e2d9ce] text-[#705d00] text-xs font-medium self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#705d00]" />
          <span>{config.securityBadge || "Encrypted Healthcare Schedule"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 pt-8">
        {/* ============================================================ */}
        {/* STEP 1: CHOOSE CLINICAL SERVICE & FORMAT                     */}
        {/* ============================================================ */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#412a1e] text-[#fcf9f2] text-xs font-semibold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#412a1e] font-normal">
                  {config.step1Title || "Choose Clinical Service"}
                </h3>
                <p className="text-xs text-[#82746f] mt-0.5">
                  Select your area of therapeutic focus and preferred consultation modality.
                </p>
              </div>
            </div>

            {/* 100% Online Telehealth Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fbf7ee] border border-[#705d00]/30 text-[#705d00] text-xs font-semibold self-start sm:self-auto shrink-0 shadow-2xs">
              <Video className="w-3.5 h-3.5 text-[#705d00]" />
              <span>100% Online Telehealth (Google Meet)</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[#705d00] text-white shadow-xs font-semibold"
                    : "bg-[#f6f3ec] text-[#5a4033] hover:bg-[#ece8df] border border-[#e2d9ce]"
                }`}
              >
                All Services ({services.length})
              </button>
              {categories.map((cat) => {
                const count = services.filter((s) => s.categoryId === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-[#705d00] text-white shadow-xs font-semibold"
                        : "bg-[#f6f3ec] text-[#5a4033] hover:bg-[#ece8df] border border-[#e2d9ce]"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {count > 0 && (
                      <span
                        className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-[#e2d9ce] text-[#5a4033]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Clinical Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredServices.map((svc) => {
              const isSelected = selectedService?.id === svc.id;
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`relative cursor-pointer rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between border ${
                    isSelected
                      ? "bg-[#fbf7ee] border-[#705d00] shadow-[0_4px_20px_rgba(112,93,0,0.12)] ring-1 ring-[#705d00]"
                      : "bg-[#f6f3ec]/70 hover:bg-[#f6f3ec] border-[#e2d9ce] hover:border-[#cfc4b7]"
                  }`}
                >
                  <div>
                    {/* Top Row: Category Badge + Price */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#e5e2db] text-[#4f443f]">
                        {svc.categoryName || "Specialization"}
                      </span>
                      <span className="text-xs font-bold text-[#705d00]">
                        ₹{svc.price?.toLocaleString("en-IN") || "1,800"}
                      </span>
                    </div>

                    {/* Service Name */}
                    <h4 className="font-serif text-base sm:text-lg text-[#412a1e] font-semibold leading-snug">
                      {svc.name}
                    </h4>

                    {/* Duration */}
                    <p className="text-xs text-[#82746f] mt-1 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#705d00]" />
                      <span>{svc.durationMinutes || 50} Minutes Session</span>
                    </p>

                    {/* Description */}
                    <p className="text-xs text-[#4f443f] mt-3 leading-relaxed line-clamp-3">
                      {svc.shortDescription}
                    </p>
                  </div>

                  {/* Card Bottom: Modality tag + Radio Circle */}
                  <div className="pt-4 mt-4 border-t border-[#e2d9ce]/60 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#5a4033] flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#705d00]" />
                      <span>Online Telehealth</span>
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#705d00] text-white"
                          : "border border-[#82746f]/50 bg-white/60"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* STEP 2: CHOOSE PREFERRED DATE & TIME                         */}
        {/* ============================================================ */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#412a1e] text-[#fcf9f2] text-xs font-semibold flex items-center justify-center shrink-0">
              2
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#412a1e] font-normal">
              Choose Preferred Date &amp; Time
            </h3>
          </div>

          {/* Calendar & Time Slots Box */}
          <div className="rounded-2xl border border-[#e2d9ce] bg-[#f6f3ec]/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT: CALENDAR (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-7 border-b lg:border-b-0 lg:border-r border-[#e2d9ce] flex flex-col justify-between">
              <div>
                {/* Month Navigator */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-lg text-[#412a1e] font-medium">
                    {viewDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a4033] hover:bg-[#e5e2db] transition-colors cursor-pointer"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a4033] hover:bg-[#e5e2db] transition-colors cursor-pointer"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Headers (MON - SUN) */}
                <div className="grid grid-cols-7 text-center mb-2">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                    <span
                      key={d}
                      className="text-[11px] font-semibold text-[#82746f] py-1 tracking-wider"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((item, idx) => {
                    const isSelected = isSameDate(item.date, selectedDate);
                    const past = isPastDate(item.date);
                    const itemDateStr = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, "0")}-${String(item.date.getDate()).padStart(2, "0")}`;
                    const dayOverride = config.singleDaySlots?.find((s) => s.date === itemDateStr);
                    const hasCustomSingleDaySlots = !!(dayOverride && dayOverride.slots && dayOverride.slots.length > 0 && !dayOverride.isOffDay);
                    const isAvailable = item.isCurrentMonth && !past && (hasCustomSingleDaySlots || item.date.getDay() !== 0);

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!item.isCurrentMonth || past}
                        onClick={() => {
                          if (item.isCurrentMonth && !past) {
                            setSelectedDate(item.date);
                          }
                        }}
                        className={`relative h-10 w-full rounded-lg flex flex-col items-center justify-center text-xs transition-all font-medium ${
                          !item.isCurrentMonth
                            ? "text-[#82746f]/30 cursor-default"
                            : past
                            ? "text-[#82746f]/40 cursor-not-allowed"
                            : isSelected
                            ? "bg-[#412a1e] text-[#fcf9f2] font-semibold shadow-sm"
                            : "text-[#1c1c18] hover:bg-[#e5e2db]/70 cursor-pointer"
                        }`}
                      >
                        <span>{item.day}</span>
                        {/* Dot indicator for available days */}
                        {isAvailable && !isSelected && (
                          <span
                            className={`w-1 h-1 rounded-full absolute bottom-1 ${
                              hasCustomSingleDaySlots
                                ? "bg-[#705d00] ring-1 ring-[#F4D242]"
                                : "bg-[#F4D242]"
                            }`}
                          ></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Legend */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-6 mt-6 border-t border-[#e2d9ce]/60 text-[11px] text-[#82746f]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#412a1e] inline-block"></span>
                  <span>Selected Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F4D242] inline-block"></span>
                  <span>Daily Slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#705d00] ring-1 ring-[#F4D242] inline-block"></span>
                  <span>Custom Day Slots</span>
                </div>
              </div>
            </div>

            {/* RIGHT: TIME SLOTS & CADENCE (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between bg-[#fcf9f2]/60">
              <div className="space-y-4">
                {/* Header with selected date and timezone */}
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-semibold text-[#412a1e] tracking-wider text-[11px]">
                    {formattedSelectedDateHeader}
                  </span>
                  <span className="text-[#82746f] text-[11px] font-medium">
                    {config.timezone || "IST (GMT+5:30)"}
                  </span>
                </div>

                {/* Single Day Custom Hours Banner */}
                {activeSingleDayOverride && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fbf7ee] border border-[#705d00]/30 text-[#705d00] text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#705d00]" />
                    <span>
                      {activeSingleDayOverride.fromTime && activeSingleDayOverride.toTime
                        ? `Operating Hours: ${activeSingleDayOverride.fromTime} – ${activeSingleDayOverride.toTime}`
                        : "Custom Hours for this Day"}
                      {activeSingleDayOverride.note ? ` · ${activeSingleDayOverride.note}` : ""}
                    </span>
                  </div>
                )}

                {/* Slots Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {activeTimeSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedTime(slot.time)}
                        className={`${
                          slot.isEvening ? "col-span-2" : "col-span-1"
                        } py-2.5 px-3 rounded-xl text-xs font-medium transition-all text-center border cursor-pointer ${
                          isSelected
                            ? "bg-[#F4D242] border-[#F4D242] text-[#221b00] font-semibold shadow-sm"
                            : "bg-[#f6f3ec] hover:bg-[#ece8df] border-[#e2d9ce] text-[#412a1e]"
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gentle Cadence Notice */}
              <div className="rounded-xl bg-[#f6f3ec] p-4 border border-[#e2d9ce]/80 mt-6 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#412a1e]">
                  <Clock className="w-3.5 h-3.5 text-[#705d00]" />
                  <span>{config.cadenceTitle || "50-Minute Gentle Cadence"}</span>
                </div>
                <p className="text-[11px] text-[#4f443f] leading-relaxed">
                  {config.cadenceDescription || "All sessions conclude with 10 minutes of integration buffer to keep conversations unhurried."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* STEP 3: YOUR CONFIDENTIAL INFORMATION                        */}
        {/* ============================================================ */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#412a1e] text-[#fcf9f2] text-xs font-semibold flex items-center justify-center shrink-0">
              3
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#412a1e] font-normal">
              {config.step3Title || "Your Confidential Information"}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Selected Service Summary Pill */}
            {selectedService && (
              <div className="bg-[#f6f3ec] rounded-2xl p-4 sm:p-5 border border-[#e2d9ce] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#705d00] block mb-1">
                    Booking Summary
                  </span>
                  <div className="font-serif font-semibold text-base text-[#412a1e]">
                    {selectedService.name}
                  </div>
                  <div className="text-[11px] text-[#82746f] mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#e5e2db] text-[#412a1e] font-medium">
                      {selectedService.categoryName}
                    </span>
                    <span>·</span>
                    <span>{selectedService.durationMinutes} mins</span>
                    <span>·</span>
                    <span className="font-medium text-[#412a1e]">
                      Online Telehealth (Google Meet)
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e2d9ce]/60">
                  <div className="text-base font-bold text-[#705d00]">
                    ₹{selectedService.price?.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-[#412a1e] font-medium mt-0.5">
                    {selectedDateStr} at {selectedTime}
                  </div>
                </div>
              </div>
            )}

            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#82746f] block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-4 py-3 rounded-xl bg-[#f6f3ec] border border-[#e2d9ce] text-sm text-[#1c1c18] placeholder-[#82746f]/60 focus:outline-none focus:border-[#705d00] focus:ring-1 focus:ring-[#705d00] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#82746f] block">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sanctuary.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#f6f3ec] border border-[#e2d9ce] text-sm text-[#1c1c18] placeholder-[#82746f]/60 focus:outline-none focus:border-[#705d00] focus:ring-1 focus:ring-[#705d00] transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Contact Channel & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#82746f] block">
                  Preferred Contact Channel
                </label>
                <select
                  value={contactChannel}
                  onChange={(e) => setContactChannel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#f6f3ec] border border-[#e2d9ce] text-sm text-[#1c1c18] focus:outline-none focus:border-[#705d00] focus:ring-1 focus:ring-[#705d00] transition-colors cursor-pointer"
                >
                  {(config.contactChannels || CONTACT_CHANNELS).map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#82746f] block">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-[#f6f3ec] border border-[#e2d9ce] text-sm text-[#1c1c18] placeholder-[#82746f]/60 focus:outline-none focus:border-[#705d00] focus:ring-1 focus:ring-[#705d00] transition-colors"
                />
              </div>
            </div>

            {/* Row 3: Notes Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#82746f] block">
                Is there anything you would like me to know beforehand? (Completely Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share what is present for you right now, or leave this entirely blank. We can begin exactly wherever you are."
                className="w-full px-4 py-3 rounded-xl bg-[#f6f3ec] border border-[#e2d9ce] text-sm text-[#1c1c18] placeholder-[#82746f]/60 focus:outline-none focus:border-[#705d00] focus:ring-1 focus:ring-[#705d00] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Ethics & Privacy Notice */}
            <div className="flex items-center gap-2 pt-2 text-xs text-[#82746f]">
              <Lock className="w-3.5 h-3.5 text-[#705d00] shrink-0" />
              <span>
                {config.ethicsNotice || "All communications are bound by strict psychological ethics and confidential data protocols."}
              </span>
            </div>
          </div>
        </section>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs">
            {errorMessage}
          </div>
        )}

        {/* ============================================================ */}
        {/* BOTTOM ACTION BAR                                            */}
        {/* ============================================================ */}
        <div className="pt-6 border-t border-[#e2d9ce] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5a4033]">
            <span className="w-2 h-2 rounded-full bg-[#F4D242] inline-block animate-pulse"></span>
            <span>{config.instantConfirmationText || "Instant booking confirmation & Google Meet invitation"}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#412a1e] text-[#fcf9f2] text-sm font-semibold hover:bg-[#5a4033] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Scheduling session...</span>
            ) : (
              <>
                <span>{config.submitButtonText || "Confirm & Request Session"}</span>
                <ArrowRight className="w-4 h-4 text-[#F4D242]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
