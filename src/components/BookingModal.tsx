"use client";

import { useState, useEffect } from "react";
import {
  X,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Download,
  MessageCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { areSlotsMatching } from "@/lib/booking-config";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

interface BookingData {
  id: string;
  format: "online" | "in-person";
  sessionType: string;
  service: string;
  date: string;
  timeSlot: string;
  fullName: string;
  email: string;
  phone: string;
  pronouns: string;
  notes: string;
  priorTherapy: string;
  createdAt: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  initialService,
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [format, setFormat] = useState<"online" | "in-person">("online");
  const [sessionType, setSessionType] = useState("Standard Individual Session (50 mins)");
  const [service, setService] = useState(
    initialService || "Emotional Wellbeing"
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Client Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pronouns, setPronouns] = useState("she/her");
  const [notes, setNotes] = useState("");
  const [priorTherapy, setPriorTherapy] = useState("no");
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(
    null
  );

  useEffect(() => {
    if (initialService) {
      setService(initialService);
    }
  }, [initialService]);

  // Generate the next 14 days for selection
  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      monthName: d.toLocaleDateString("en-US", { month: "short" }),
      dayNumber: d.getDate(),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0].iso);
    }
  }, [availableDates, selectedDate]);

  const [bookedSlots, setBookedSlots] = useState<Array<{ date: string; time: string }>>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [bookRes, contentRes] = await Promise.all([
          fetch("/api/bookings"),
          fetch("/api/content", { cache: "no-store" }),
        ]);
        if (bookRes.ok) {
          const data = await bookRes.json();
          if (Array.isArray(data.bookedSlots)) {
            setBookedSlots(data.bookedSlots);
          }
        }
        if (contentRes.ok) {
          const content = await contentRes.json();
          if (content.bookingFormConfig) {
            setConfig(content.bookingFormConfig);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadData();
  }, []);

  const isSlotBooked = (dateStr: string, timeStr: string) => {
    return bookedSlots.some(
      (b) => b.date === dateStr && areSlotsMatching(b.time, timeStr)
    );
  };

  // Only scheduled slots for selected date
  const selectedDayOverride = config?.singleDaySlots?.find((s: any) => s.date === selectedDate);
  const isSelectedDateOnLeave = !!(
    selectedDayOverride?.isOffDay ||
    (selectedDayOverride && Array.isArray(selectedDayOverride.slots) && selectedDayOverride.slots.length === 0)
  );

  const candidateSlots: Array<{ time: string; isEvening?: boolean }> =
    isSelectedDateOnLeave
      ? []
      : selectedDayOverride && Array.isArray(selectedDayOverride.slots) && selectedDayOverride.slots.length > 0
      ? selectedDayOverride.slots
      : config?.onlyScheduledSlots === false
      ? [
          { time: "10:00 AM" },
          { time: "11:30 AM" },
          { time: "02:00 PM" },
          { time: "03:30 PM" },
          { time: "05:00 PM" },
          { time: "06:30 PM" },
          { time: "07:30 PM" },
        ]
      : [];

  const parseHourFromTime = (timeStr: string) => {
    const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!m) return 12;
    let h = parseInt(m[1], 10);
    const p = m[3] ? m[3].toUpperCase() : "";
    if (p === "PM" && h < 12) h += 12;
    if (p === "AM" && h === 12) h = 0;
    return h;
  };

  const morningSlots = candidateSlots
    .filter((s) => parseHourFromTime(s.time) < 12)
    .map((s) => s.time);
  const afternoonSlots = candidateSlots
    .filter((s) => parseHourFromTime(s.time) >= 12 && parseHourFromTime(s.time) < 17)
    .map((s) => s.time);
  const eveningSlots = candidateSlots
    .filter((s) => parseHourFromTime(s.time) >= 17)
    .map((s) => s.time);

  const handleNextFromStep1 = () => setStep(2);

  const handleNextFromStep2 = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and an available time slot.");
      return;
    }
    setStep(3);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }

    const newBooking: BookingData = {
      id: "ASW-" + Math.floor(100000 + Math.random() * 900000),
      format,
      sessionType,
      service,
      date: selectedDate,
      timeSlot: selectedTime,
      fullName,
      email,
      phone,
      pronouns,
      notes,
      priorTherapy,
      createdAt: new Date().toISOString(),
    };

    // Save to practice database & Supabase via API
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: fullName,
        clientEmail: email,
        clientPhone: phone,
        serviceName: service,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        format: "online",
        clientMessage: notes,
        provider: "internal",
      }),
    }).catch((err) => {
      console.error("Failed to sync booking to backend:", err);
    });

    // Save to localStorage as well
    try {
      const existing = JSON.parse(
        localStorage.getItem("aswathy_counselling_bookings") || "[]"
      );
      existing.push(newBooking);
      localStorage.setItem(
        "aswathy_counselling_bookings",
        JSON.stringify(existing)
      );
    } catch {
      // LocalStorage fallback
    }

    setConfirmedBooking(newBooking);
    setStep(4);

    // Fire celebratory soothing confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#705d00", "#F4D242", "#6D4C3D", "#ffdbc8"],
    });
  };

  // Download .ics calendar event
  const handleDownloadIcs = () => {
    if (!confirmedBooking) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aswathy Counselling Psychology//Consultation//EN
BEGIN:VEVENT
UID:${confirmedBooking.id}@aswathycounselling.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:Therapy Consultation with Aswathy Jeyarajasekar (${confirmedBooking.service})
DESCRIPTION:Format: ${confirmedBooking.format.toUpperCase()}\\nSession: ${confirmedBooking.sessionType}\\nConfidential consultation with Aswathy Jeyarajasekar.
LOCATION:${
      confirmedBooking.format === "online"
        ? "Google Meet (Link will be sent to your email)"
        : "Sanctuary Consulting Room"
    }
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Aswathy-Consultation-${confirmedBooking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp connection message
  const handleWhatsAppChat = () => {
    if (!confirmedBooking) return;
    const msg = encodeURIComponent(
      `Hello Aswathy J, I have booked a ${confirmedBooking.sessionType} on ${confirmedBooking.date} at ${confirmedBooking.timeSlot} (Booking ID: ${confirmedBooking.id}). Looking forward to our conversation.`
    );
    window.open(`https://api.whatsapp.com/send/?phone=917550002973&text=${msg}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-tertiary/65 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-space-lg sm:p-space-xl pb-space-md border-b border-surface-container bg-surface-container-low flex items-center justify-between">
          <div>
            <div className="flex items-center gap-space-xs text-secondary font-label-caps text-label-caps uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe &amp; Confidential Booking</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary tracking-tight">
              Schedule Your Session
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Intake Form Steps */}
        <>
            {/* Step Indicator Progress Bar */}
            <div className="px-space-xl pt-space-md pb-space-xs bg-surface flex items-center justify-between border-b border-surface-container/60 text-[12px] font-label-md text-on-surface-variant">
              <div
                className={`flex items-center gap-1 ${
                  step >= 1 ? "text-primary font-semibold" : ""
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step >= 1
                      ? "bg-primary text-surface"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  1
                </span>
                <span>Focus &amp; Mode</span>
              </div>
              <span className="text-outline-variant">→</span>
              <div
                className={`flex items-center gap-1 ${
                  step >= 2 ? "text-primary font-semibold" : ""
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step >= 2
                      ? "bg-primary text-surface"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  2
                </span>
                <span>Date &amp; Time</span>
              </div>
              <span className="text-outline-variant">→</span>
              <div
                className={`flex items-center gap-1 ${
                  step >= 3 ? "text-primary font-semibold" : ""
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step >= 3
                      ? "bg-primary text-surface"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  3
                </span>
                <span>Intake</span>
              </div>
              <span className="text-outline-variant">→</span>
              <div
                className={`flex items-center gap-1 ${
                  step === 4 ? "text-primary font-semibold" : ""
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === 4
                      ? "bg-secondary text-surface"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  ✓
                </span>
                <span>Confirmation</span>
              </div>
            </div>

            {/* Modal Content / Wizard Steps */}
            <div className="p-space-lg sm:p-space-xl overflow-y-auto custom-scrollbar flex-1">
              {/* STEP 1: Mode & Service */}
              {step === 1 && (
                <div className="space-y-space-lg animate-fadeIn">
                  {/* Consultation Format */}
                  <div className="space-y-space-xs">
                    <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block">
                      Consultation Format
                    </label>
                    <div className="p-space-md rounded-2xl border-2 border-primary/20 bg-surface-container-low shadow-xs flex items-start gap-space-sm">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-headline-sm text-sm font-semibold text-primary">
                            100% Online Telehealth Consultation
                          </div>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Online Only
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          Confidential, encrypted Google Meet video link provided immediately upon booking. Attend comfortably from your home anywhere in India or abroad.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Session Tier / Type */}
                  <div className="space-y-space-xs">
                    <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block">
                      Session Offering
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          name: "Complimentary Clarity Chat (15 mins)",
                          desc: "A brief, gentle conversation to ask questions and see if we feel aligned.",
                          cost: "Free",
                        },
                        {
                          name: "Standard Individual Session (50 mins)",
                          desc: "Comprehensive exploratory session focusing on your emotional goals.",
                          cost: "₹1,800",
                        },
                        {
                          name: "Extended Deep-Dive Session (75 mins)",
                          desc: "Dedicated space for nuanced exploration, grief integration, or transitions.",
                          cost: "₹2,500",
                        },
                      ].map((t) => (
                        <div
                          key={t.name}
                          onClick={() => setSessionType(t.name)}
                          className={`p-space-md rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            sessionType === t.name
                              ? "border-primary bg-surface-container shadow-xs"
                              : "border-surface-container hover:border-outline-variant bg-surface"
                          }`}
                        >
                          <div>
                            <div className="font-headline-sm text-sm font-semibold text-primary">
                              {t.name}
                            </div>
                            <p className="text-body-sm text-on-surface-variant mt-0.5">
                              {t.desc}
                            </p>
                          </div>
                          <span className="font-headline-sm text-primary font-semibold ml-space-sm whitespace-nowrap">
                            {t.cost}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary Focus Area */}
                  <div className="space-y-space-xs">
                    <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block">
                      Primary Therapeutic Focus
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-space-md py-space-sm rounded-xl border border-surface-container-high bg-surface text-on-surface font-body-md focus:outline-none focus:border-primary"
                    >
                      <option value="Emotional Wellbeing">
                        Emotional Wellbeing &amp; Stress Management
                      </option>
                      <option value="Relationship Dynamics">
                        Relationship Dynamics &amp; Boundary Exploration
                      </option>
                      <option value="Life Transitions">
                        Navigating Life Transitions &amp; Identity Shifts
                      </option>
                      <option value="Grief & Loss">
                        Compassionate Grief &amp; Loss Support
                      </option>
                      <option value="Self-Discovery">
                        Self-Discovery, Authenticity &amp; Self-Compassion
                      </option>
                      <option value="General Exploration">
                        General Exploratory Consultation
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Date & Time Picker */}
              {step === 2 && (
                <div className="space-y-space-lg animate-fadeIn">
                  <div>
                    <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block mb-space-xs">
                      1. Select a Convenient Day
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {availableDates.map((item) => {
                        const isSelected = selectedDate === item.iso;
                        return (
                          <button
                            key={item.iso}
                            type="button"
                            onClick={() => setSelectedDate(item.iso)}
                            className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary text-surface shadow-sm"
                                : "border-surface-container bg-surface hover:bg-surface-container-low text-on-surface"
                            }`}
                          >
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider ${
                                isSelected ? "text-surface-bright" : "text-on-surface-variant"
                              }`}
                            >
                              {item.dayName}
                            </span>
                            <span className="font-headline-sm text-lg font-bold my-0.5">
                              {item.dayNumber}
                            </span>
                            <span
                              className={`text-[10px] ${
                                isSelected ? "text-surface-bright" : "text-on-surface-variant"
                              }`}
                            >
                              {item.monthName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block mb-space-xs">
                      2. Available Time Slots (IST / UTC+5:30)
                    </label>

                    {candidateSlots.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant text-center space-y-1.5 my-2">
                        <p className="text-xs font-semibold text-primary">
                          There is no slot available for this date
                        </p>
                        <p className="text-[11px] text-on-surface-variant max-w-xs mx-auto">
                          No consultation slots are scheduled for this date. Please choose another date with open slots.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-space-sm">
                        {morningSlots.length > 0 && (
                          <div>
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant block mb-1">
                              Morning
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {morningSlots.map((time) => {
                                const isBooked = isSlotBooked(selectedDate, time);
                                const isSelected = selectedTime === time;

                                if (isBooked) {
                                  return (
                                    <div
                                      key={time}
                                      className="px-3 py-2 rounded-xl text-xs font-medium border bg-surface-container text-on-surface-variant/60 cursor-not-allowed flex items-center gap-1.5 opacity-70"
                                      title="Slot unavailable"
                                    >
                                      <span className="line-through">{time}</span>
                                      <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-surface text-secondary">
                                        No slot
                                      </span>
                                    </div>
                                  );
                                }

                                return (
                                  <button
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isSelected
                                        ? "bg-primary text-surface border-primary shadow-xs"
                                        : "bg-surface hover:bg-surface-container border-surface-container text-on-surface"
                                    }`}
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{time}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {afternoonSlots.length > 0 && (
                          <div>
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant block mb-1">
                              Afternoon
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {afternoonSlots.map((time) => {
                                const isBooked = isSlotBooked(selectedDate, time);
                                const isSelected = selectedTime === time;

                                if (isBooked) {
                                  return (
                                    <div
                                      key={time}
                                      className="px-3 py-2 rounded-xl text-xs font-medium border bg-surface-container text-on-surface-variant/60 cursor-not-allowed flex items-center gap-1.5 opacity-70"
                                      title="Slot unavailable"
                                    >
                                      <span className="line-through">{time}</span>
                                      <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-surface text-secondary">
                                        No slot
                                      </span>
                                    </div>
                                  );
                                }

                                return (
                                  <button
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isSelected
                                        ? "bg-primary text-surface border-primary shadow-xs"
                                        : "bg-surface hover:bg-surface-container border-surface-container text-on-surface"
                                    }`}
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{time}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {eveningSlots.length > 0 && (
                          <div>
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant block mb-1">
                              Evening
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {eveningSlots.map((time) => {
                                const isBooked = isSlotBooked(selectedDate, time);
                                const isSelected = selectedTime === time;

                                if (isBooked) {
                                  return (
                                    <div
                                      key={time}
                                      className="px-3 py-2 rounded-xl text-xs font-medium border bg-surface-container text-on-surface-variant/60 cursor-not-allowed flex items-center gap-1.5 opacity-70"
                                      title="Slot unavailable"
                                    >
                                      <span className="line-through">{time}</span>
                                      <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-surface text-secondary">
                                        No slot
                                      </span>
                                    </div>
                                  );
                                }

                                return (
                                  <button
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isSelected
                                        ? "bg-primary text-surface border-primary shadow-xs"
                                        : "bg-surface hover:bg-surface-container border-surface-container text-on-surface"
                                    }`}
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{time}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Intake Details */}
              {step === 3 && (
                <form onSubmit={handleConfirmBooking} className="space-y-space-md animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    <div>
                      <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maya Sundaram"
                        className="w-full px-space-md py-space-sm rounded-xl border border-surface-container-high bg-surface text-on-surface font-body-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block mb-1">
                        Pronouns
                      </label>
                      <input
                        type="text"
                        value={pronouns}
                        onChange={(e) => setPronouns(e.target.value)}
                        placeholder="e.g. she/her, they/them"
                        className="w-full px-space-md py-space-sm rounded-xl border border-surface-container-high bg-surface text-on-surface font-body-md focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    <div>
                      <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="maya@example.com"
                        className="w-full px-space-md py-space-sm rounded-xl border border-surface-container-high bg-surface text-on-surface font-body-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 755 000 2973"
                        className="w-full px-space-md py-space-sm rounded-xl border border-surface-container-high bg-surface text-on-surface font-body-md focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block mb-1">
                      Have you attended therapy before?
                    </label>
                    <div className="flex gap-space-md">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="prior"
                          value="no"
                          checked={priorTherapy === "no"}
                          onChange={() => setPriorTherapy("no")}
                          className="accent-primary"
                        />
                        <span>No, this is my first time</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="prior"
                          value="yes"
                          checked={priorTherapy === "yes"}
                          onChange={() => setPriorTherapy("yes")}
                          className="accent-primary"
                        />
                        <span>Yes, I have prior experience</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block mb-1">
                      What brings you here? (Optional &amp; Confidential)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Feel free to share anything you are comfortable disclosing. There is no pressure to have everything figured out."
                      className="w-full px-space-md py-space-sm rounded-xl border border-surface-container-high bg-surface text-on-surface font-body-md focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="accent-primary mt-1"
                    />
                    <label htmlFor="terms" className="text-body-sm text-on-surface-variant cursor-pointer">
                      I understand this session is strictly confidential, follows APA/RCI ethics, and is not a crisis-intervention emergency service.
                    </label>
                  </div>

                  <div className="pt-space-xs">
                    <button
                      type="submit"
                      disabled={!agreedToTerms}
                      className="w-full py-space-md rounded-full bg-warm-umber hover:bg-earth-espresso text-surface font-label-md text-label-md font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-secondary-container" />
                      <span>Confirm &amp; Reserve Session</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Booking Confirmation Sanctuary */}
              {step === 4 && confirmedBooking && (
                <div className="space-y-space-lg text-center animate-fadeIn py-space-sm">
                  <div className="w-16 h-16 rounded-full bg-secondary-fixed text-primary mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>

                  <div className="space-y-space-xxs">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
                      Reservation Confirmed
                    </span>
                    <h4 className="font-headline-md text-headline-md text-primary tracking-tight">
                      Thanks for Choosing Us!
                    </h4>
                    <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                      Thank you, {confirmedBooking.fullName}! We have received your booking and <strong>we will contact you soon</strong>. A confirmation email has been sent to{" "}
                      <span className="font-semibold text-primary">{confirmedBooking.email}</span>.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-space-lg rounded-2xl bg-surface-container-low border border-surface-container max-w-md mx-auto text-left space-y-space-xs">
                    <div className="flex justify-between border-b border-surface-container pb-2 text-sm">
                      <span className="text-on-surface-variant">Booking Reference:</span>
                      <span className="font-mono font-bold text-primary">{confirmedBooking.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-surface-container py-2 text-sm">
                      <span className="text-on-surface-variant">Consultation Type:</span>
                      <span className="font-medium text-primary text-right">{confirmedBooking.sessionType}</span>
                    </div>
                    <div className="flex justify-between border-b border-surface-container py-2 text-sm">
                      <span className="text-on-surface-variant">Date &amp; Time:</span>
                      <span className="font-medium text-primary text-right">
                        {confirmedBooking.date} at {confirmedBooking.timeSlot}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm">
                      <span className="text-on-surface-variant">Format:</span>
                      <span className="font-medium text-primary capitalize flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-secondary" />
                        <span>Online Telehealth (Google Meet)</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-space-sm pt-space-xs">
                    <button
                      type="button"
                      onClick={handleDownloadIcs}
                      className="px-space-lg py-space-sm rounded-full bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md flex items-center gap-space-xs border border-surface-container-high transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-secondary" />
                      <span>Add to Calendar (.ics)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppChat}
                      className="px-space-lg py-space-sm rounded-full bg-primary text-surface hover:bg-primary-container font-label-md text-label-md flex items-center gap-space-xs transition-colors shadow-sm cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-secondary-container" />
                      <span>WhatsApp Notification</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer Navigation (Steps 1 & 2) */}
            {step < 3 && (
              <div className="p-space-lg sm:p-space-xl pt-space-sm border-t border-surface-container bg-surface flex items-center justify-between">
                {step === 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-space-lg py-space-sm rounded-full text-on-surface-variant hover:text-primary font-label-md text-label-md flex items-center gap-space-xs transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  type="button"
                  onClick={step === 1 ? handleNextFromStep1 : handleNextFromStep2}
                  className="px-space-xl py-space-sm rounded-full bg-primary text-surface hover:bg-primary-container transition-all duration-300 font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-md group cursor-pointer"
                >
                  <span>{step === 1 ? "Select Date & Time" : "Enter Details"}</span>
                  <ArrowRight className="w-4 h-4 text-secondary-container transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="p-space-lg sm:p-space-xl pt-space-sm border-t border-surface-container bg-surface flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-space-lg py-space-sm rounded-full text-on-surface-variant hover:text-primary font-label-md text-label-md flex items-center gap-space-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="p-space-lg sm:p-space-xl pt-space-sm border-t border-surface-container bg-surface flex items-center justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-space-2xl py-space-sm rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-medium transition-colors cursor-pointer"
                >
                  Return to Sanctuary
                </button>
              </div>
            )}
        </>
      </div>
    </div>
  );
}
