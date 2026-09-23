"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
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
  ArrowLeft,
  Check,
  CalendarPlus,
  MessageSquare,
  RefreshCw,
  CreditCard,
  CalendarOff,
  CalendarX,
  AlertCircle,
  Ban,
  Megaphone,
  Info,
  Bell,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { BookingFormConfig, SessionFormat } from "@/lib/booking-config";
import { DEFAULT_BOOKING_FORM_CONFIG, areSlotsMatching } from "@/lib/booking-config";
import type { Service, ServiceCategory } from "@/lib/types";

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
  const [bookedSlots, setBookedSlots] = useState<Array<{ date: string; time: string }>>([]);

  // Live Clinical Services & Categories state
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<Service>(DEFAULT_SERVICES[0]);
  const selectedModality = "online";

  // Function to refresh booked slots from the server
  const refreshBookedSlots = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.bookedSlots)) {
        setBookedSlots(data.bookedSlots);
      }
    } catch {
      // Non-fatal
    }
  }, []);

  // Fetch dynamic session formats and form configuration from admin
  useEffect(() => {
    async function loadLiveConfig() {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.bookedSlots)) {
          setBookedSlots(data.bookedSlots);
        }
        if (data.bookingFormConfig) {
          const loadedConfig: BookingFormConfig = {
            ...data.bookingFormConfig,
            blockedSlots: data.blockedSlots || [],
          };
          setConfig(loadedConfig);
          if (Array.isArray(data.bookingFormConfig.timeSlots) && data.bookingFormConfig.timeSlots.length > 0) {
            setSelectedTime(data.bookingFormConfig.timeSlots[0].time);
          }
          if (Array.isArray(data.bookingFormConfig.contactChannels) && data.bookingFormConfig.contactChannels.length > 0) {
            setContactChannel(data.bookingFormConfig.contactChannels[0]);
          }

          // If only explicitly scheduled slots are allowed, intelligently select the first upcoming date that has active scheduled slots
          if (loadedConfig.onlyScheduledSlots !== false && Array.isArray(loadedConfig.singleDaySlots)) {
            const todayStr = new Date().toISOString().split("T")[0];
            const firstScheduledWorkingDay = loadedConfig.singleDaySlots.find(
              (s) => s.date >= todayStr && !s.isOffDay && Array.isArray(s.slots) && s.slots.length > 0
            );
            if (firstScheduledWorkingDay) {
              const [yr, mo, dy] = firstScheduledWorkingDay.date.split("-").map(Number);
              const targetDate = new Date(yr, mo - 1, dy);
              setSelectedDate(targetDate);
              setViewDate(targetDate);
              if (firstScheduledWorkingDay.slots.length > 0) {
                setSelectedTime(firstScheduledWorkingDay.slots[0].time);
              }
            }
          }
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadLiveConfig();
    refreshBookedSlots();
  }, [refreshBookedSlots]);

  // Fetch live clinical services & categories
  useEffect(() => {
    async function loadLiveServices() {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
          setSelectedService((prev) => {
            if (initialServiceId) {
              const byProp = data.services.find((s: Service) => s.id === initialServiceId);
              if (byProp) return byProp;
            }
            const matched = prev ? data.services.find((s: Service) => s.id === prev.id) : null;
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
    paymentStatus?: "pending" | "paid" | "refunded";
    razorpayPaymentId?: string;
    meetingLink?: string;
  } | null>(null);

  // Razorpay Payment state
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Multi-step wizard state (5 steps)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(true);
  const formTopRef = React.useRef<HTMLDivElement>(null);

  const scrollToFormTop = () => {
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const el = document.getElementById("booking-form");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToStep = (step: 1 | 2 | 3 | 4 | 5) => {
    setCurrentStep(step);
    setTimeout(scrollToFormTop, 40);
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setErrorMessage("");
    setTimeout(() => {
      goToStep(2);
    }, 220);
  };

  const handleNextStep = () => {
    setErrorMessage("");
    if (currentStep === 1) {
      if (!selectedService) {
        setErrorMessage("Please select a clinical service before continuing.");
        return;
      }
      goToStep(2);
    } else if (currentStep === 2) {
      if (isDateOnLeave) {
        setErrorMessage("The therapist is on leave for this date. Please pick another date.");
        return;
      }
      if (activeTimeSlots.length === 0) {
        setErrorMessage("There are no slots available for this date. Please choose another date.");
        return;
      }
      if (!selectedTime || isSlotBookedOrBlocked(selectedDateStr, selectedTime)) {
        setErrorMessage("Please select an available time slot before continuing.");
        return;
      }
      goToStep(3);
    } else if (currentStep === 3) {
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMessage("Please provide a valid email address.");
        return;
      }
      goToStep(4);
    } else if (currentStep === 4) {
      if (!guidelinesAccepted) {
        setErrorMessage("Please review and acknowledge the session guidelines to proceed.");
        return;
      }
      goToStep(5);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    if (currentStep > 1) {
      goToStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

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

  // Check if current date has a full-day block in blockedSlots
  const isFullDayBlocked = useMemo(() => {
    if (!config.blockedSlots || !Array.isArray(config.blockedSlots)) return false;
    return config.blockedSlots.some(
      (b) =>
        b.date === selectedDateStr &&
        (b.type === "full_day" || b.type === "all_day" || b.type === "holiday")
    );
  }, [config.blockedSlots, selectedDateStr]);

  // Parse notice box message into individual points if formatted as numbered or multiline text
  const parsedNoticePoints = useMemo(() => {
    if (!config.noticeBox?.message) return [];
    const lines = config.noticeBox.message
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return lines.map((line, idx) => {
      const match = line.match(/^(\d+)[\.\)]\s*(.*)$/);
      if (match) {
        return { num: match[1], text: match[2] };
      }
      return { num: String(idx + 1), text: line };
    });
  }, [config.noticeBox?.message]);

  // Determine if the selected date is on leave or marked as an off-day
  const isDateOnLeave = useMemo(() => {
    if (activeSingleDayOverride) {
      if (activeSingleDayOverride.isOffDay) return true;
      if (Array.isArray(activeSingleDayOverride.slots) && activeSingleDayOverride.slots.length === 0) {
        return true;
      }
    }
    return isFullDayBlocked;
  }, [activeSingleDayOverride, isFullDayBlocked]);

  // Helper to determine if a specific slot on a given date is booked or individually blocked
  const isSlotBookedOrBlocked = useCallback(
    (dateStr: string, slotTime: string) => {
      // 1. Check if booked by any active booking
      const isBooked = bookedSlots.some(
        (b) => b.date === dateStr && areSlotsMatching(b.time, slotTime)
      );
      if (isBooked) return true;

      // 2. Check if individually blocked by admin in blockedSlots
      if (config.blockedSlots && Array.isArray(config.blockedSlots)) {
        const isBlocked = config.blockedSlots.some(
          (b) =>
            b.date === dateStr &&
            b.type === "slot" &&
            b.startTime &&
            areSlotsMatching(b.startTime, slotTime)
        );
        if (isBlocked) return true;
      }

      return false;
    },
    [bookedSlots, config.blockedSlots]
  );

  // Check if current date is explicitly scheduled with consultation slots
  const isDateScheduled = useMemo(() => {
    if (config.onlyScheduledSlots === false) return true;
    return !!(
      activeSingleDayOverride &&
      activeSingleDayOverride.slots &&
      activeSingleDayOverride.slots.length > 0 &&
      !activeSingleDayOverride.isOffDay
    );
  }, [config.onlyScheduledSlots, activeSingleDayOverride]);

  // Candidate time slots configured for the date before filtering booked slots
  const candidateTimeSlots = useMemo(() => {
    if (isDateOnLeave) {
      return [];
    }
    if (
      activeSingleDayOverride &&
      activeSingleDayOverride.slots &&
      activeSingleDayOverride.slots.length > 0
    ) {
      return activeSingleDayOverride.slots;
    }
    // Strict mode (default): Only explicitly scheduled day slots display in booking!
    // Remaining unscheduled dates have NO slots ("There is no slot").
    if (config.onlyScheduledSlots !== false) {
      return [];
    }
    return config.timeSlots || TIME_SLOTS;
  }, [isDateOnLeave, activeSingleDayOverride, config.onlyScheduledSlots, config.timeSlots]);

  // Active time slots: Filter out any slot that is booked or blocked
  const activeTimeSlots = useMemo(() => {
    return candidateTimeSlots.filter(
      (slot) => !isSlotBookedOrBlocked(selectedDateStr, slot.time)
    );
  }, [candidateTimeSlots, selectedDateStr, isSlotBookedOrBlocked]);

  // Determine if the selected date had slots configured, but all of them are already booked
  const isAllSlotsBooked = useMemo(() => {
    return (
      !isDateOnLeave &&
      candidateTimeSlots.length > 0 &&
      activeTimeSlots.length === 0
    );
  }, [isDateOnLeave, candidateTimeSlots, activeTimeSlots]);

  // Automatically keep selectedTime pointing to a valid slot when date changes
  useEffect(() => {
    if (activeTimeSlots.length > 0) {
      const isValid = activeTimeSlots.some((s) => s.time === selectedTime);
      if (!isValid) {
        setSelectedTime(activeTimeSlots[0].time);
      }
    } else {
      setSelectedTime("");
    }
  }, [activeTimeSlots, selectedTime]);

  // Jump to the next upcoming available date that has open, unbooked slots
  const handleJumpToNextAvailableDate = () => {
    const candidate = new Date(selectedDate);
    for (let i = 1; i <= 60; i++) {
      candidate.setDate(candidate.getDate() + 1);
      const cDateStr = `${candidate.getFullYear()}-${String(candidate.getMonth() + 1).padStart(2, "0")}-${String(candidate.getDate()).padStart(2, "0")}`;
      const override = config.singleDaySlots?.find((s) => s.date === cDateStr);
      const isLeave = !!(
        override?.isOffDay ||
        (override && Array.isArray(override.slots) && override.slots.length === 0) ||
        (config.blockedSlots &&
          config.blockedSlots.some(
            (b) =>
              b.date === cDateStr &&
              (b.type === "full_day" || b.type === "all_day" || b.type === "holiday")
          ))
      );
      const daySlots = override && override.slots && override.slots.length > 0 && !override.isOffDay
        ? override.slots
        : (config.onlyScheduledSlots !== false ? [] : (config.timeSlots || TIME_SLOTS));
      const hasOpenSlots = daySlots.some((s) => !isSlotBookedOrBlocked(cDateStr, s.time));

      if (!isLeave && hasOpenSlots) {
        setSelectedDate(new Date(candidate));
        setViewDate(new Date(candidate));
        break;
      }
    }
  };

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
    setPaymentError("");

    if (isDateOnLeave || activeTimeSlots.length === 0) {
      setErrorMessage(
        isDateOnLeave
          ? "No consultation slots are available on this date as the therapist is on leave. Please choose an alternate date."
          : isAllSlotsBooked
          ? "All consultation slots for this date have already been reserved. Please select another date."
          : "There is no slot available for this date. Please select an alternate scheduled date."
      );
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }
    if (!selectedTime || isSlotBookedOrBlocked(selectedDateStr, selectedTime)) {
      setErrorMessage("The selected appointment slot is no longer available. Please choose another time slot.");
      return;
    }

    setIsSubmitting(true);

    const formattedIsoDate = selectedDateStr;

    // If online payment is disabled by practice administrator, book directly
    if (config.enablePayment === false) {
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
            bookingStatus: "confirmed",
            paymentStatus: config.defaultPaymentStatus || "pending",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to schedule appointment. Please contact practice.");
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
          clientName: fullName.trim(),
          clientEmail: email.trim().toLowerCase(),
          paymentStatus: (data.booking?.paymentStatus || config.defaultPaymentStatus || "pending") as "pending" | "paid" | "refunded",
          meetingLink: data.booking?.meetingLink,
        };

        setConfirmedBooking(confirmed);
        setBookedSlots((prev) => [...prev, { date: formattedIsoDate, time: selectedTime }]);

        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#1A3828", "#705d00", "#F4D242", "#ffffff"],
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to record appointment.";
        setErrorMessage(msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      // 1. Create PENDING booking in Supabase & practice database first (reserving the slot)
      const bookingRes = await fetch("/api/bookings", {
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
          bookingStatus: "pending",
          paymentStatus: "pending",
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok || !bookingData.success) {
        throw new Error(bookingData.error || "Failed to reserve appointment slot. Please try another time.");
      }

      const currentBookingId = bookingData.bookingId || bookingData.booking?.id;

      // 2. Create Razorpay order on server tied to this booking
      const orderRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: currentBookingId,
          amount: selectedService?.price || 1800,
          serviceName: selectedService?.name || "Clinical Consultation",
          clientName: fullName.trim(),
          clientEmail: email.trim().toLowerCase(),
          clientPhone: phone.trim() || undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize payment gateway.");
      }

      // Helper to verify payment signature on server, generate Google Meet, and confirm appointment
      const verifyAndConfirmPayment = async (paymentDetails: {
        orderId: string;
        paymentId: string;
        signature?: string;
        isMock?: boolean;
      }) => {
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: currentBookingId,
            razorpay_order_id: paymentDetails.orderId,
            razorpay_payment_id: paymentDetails.paymentId,
            razorpay_signature: paymentDetails.signature,
            isMock: paymentDetails.isMock,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(
            verifyData.error || "Payment verification failed. Please reach out to our clinic support."
          );
        }

        const confirmed = {
          id: verifyData.booking?.id || currentBookingId,
          format: "online",
          serviceName: selectedService?.name || "Clinical Consultation",
          categoryName: selectedService?.categoryName || "Therapy",
          price: selectedService?.price || 1800,
          durationMinutes: selectedService?.durationMinutes || 50,
          date: formattedIsoDate,
          time: selectedTime,
          clientName: fullName.trim(),
          clientEmail: email.trim().toLowerCase(),
          paymentStatus: "paid" as const,
          razorpayPaymentId: paymentDetails.paymentId,
          meetingLink: verifyData.booking?.meetingLink,
        };

        setConfirmedBooking(confirmed);
        setBookedSlots((prev) => [...prev, { date: formattedIsoDate, time: selectedTime }]);

        // Trigger celebratory soothing confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#1A3828", "#705d00", "#F4D242", "#ffffff"],
        });
      };

      // 3. Load Razorpay client script
      const scriptLoaded = await loadRazorpayScript();

      // If simulated demo/mock mode without live Razorpay credentials in environment
      if (orderData.isMock && (!(window as any).Razorpay || !scriptLoaded)) {
        await verifyAndConfirmPayment({
          orderId: orderData.orderId,
          paymentId: `pay_demo_${Date.now()}`,
          signature: "verified_demo",
          isMock: true,
        });
        setIsSubmitting(false);
        return;
      }

      // 4. Open official Razorpay Checkout popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Aswathy Jeyarajasekar",
        description: `Consultation: ${selectedService?.name || "Therapy Session"}`,
        order_id: orderData.orderId,
        prefill: {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          contact: phone.trim() || "",
        },
        theme: {
          color: "#1A3828",
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setErrorMessage(
              "Payment was not completed. Your appointment slot is held temporarily as pending. Please complete payment to confirm your booking."
            );
          },
        },
        handler: async function (response: any) {
          try {
            await verifyAndConfirmPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              isMock: false,
            });
          } catch (verifyErr: any) {
            setErrorMessage(verifyErr.message || "Payment verification failed.");
          } finally {
            setIsSubmitting(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setErrorMessage(
          response.error?.description || "Payment was unsuccessful. Your appointment has not been confirmed."
        );
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong initiating booking & payment.";
      setErrorMessage(msg);
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
DESCRIPTION:Confidential consultation with Aswathy Jeyarajasekar.\\nBooking Reference: ${confirmedBooking.id}\\nFormat: ONLINE TELEHEALTH
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
      `Hello Aswathy J, I have paid and scheduled an appointment for ${confirmedBooking.serviceName} on ${confirmedBooking.date} at ${confirmedBooking.time} (Booking ID: ${confirmedBooking.id}, Payment ID: ${confirmedBooking.razorpayPaymentId || "Verified"}). Looking forward to connecting.`
    );
    let rawPhone = config.whatsappNumber || "917550002973";
    if (rawPhone.includes("98765") || !rawPhone.replace(/[^0-9]/g, "")) {
      rawPhone = "917550002973";
    }
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    window.open(`https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${msg}`, "_blank");
  };

  const resetForm = () => {
    setConfirmedBooking(null);
    setCurrentStep(1);
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setErrorMessage("");
    setPaymentError("");
    setIsPaying(false);
    setIsSubmitting(false);
  };

  // Helper to dynamically load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Initiate Razorpay payment
  const handleInitiateRazorpayPayment = async () => {
    if (!confirmedBooking) return;
    setIsPaying(true);
    setPaymentError("");

    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: confirmedBooking.id,
          amount: confirmedBooking.price || 1800,
          serviceName: confirmedBooking.serviceName,
          clientName: confirmedBooking.clientName,
          clientEmail: confirmedBooking.clientEmail,
          clientPhone: phone.trim() || undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initiate payment order.");
      }

      // 2. Load script if needed
      const scriptLoaded = await loadRazorpayScript();

      // If simulated demo/mock mode without Razorpay library available
      if (orderData.isMock && (!(window as any).Razorpay || !scriptLoaded)) {
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: confirmedBooking.id,
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            isMock: true,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          setConfirmedBooking((prev) =>
            prev
              ? {
                  ...prev,
                  paymentStatus: "paid",
                  razorpayPaymentId: verifyData.booking?.razorpayPaymentId || "pay_demo_verified",
                  meetingLink: verifyData.booking?.meetingLink || prev.meetingLink,
                }
              : null
          );
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        setIsPaying(false);
        return;
      }

      // 3. Launch official Razorpay Checkout popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Aswathy Jeyarajasekar",
        description: `Consultation: ${confirmedBooking.serviceName}`,
        order_id: orderData.orderId,
        prefill: {
          name: confirmedBooking.clientName,
          email: confirmedBooking.clientEmail,
          contact: phone.trim() || "",
        },
        theme: {
          color: "#1A3828",
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: confirmedBooking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            setConfirmedBooking((prev) =>
              prev
                ? {
                    ...prev,
                    paymentStatus: "paid",
                    razorpayPaymentId: response.razorpay_payment_id,
                    meetingLink: verifyData.booking?.meetingLink || prev.meetingLink,
                  }
                : null
            );

            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.5 },
              colors: ["#1A3828", "#705d00", "#F4D242", "#ffffff"],
            });
          } catch (verErr: any) {
            setPaymentError(verErr.message || "Payment verification failed.");
          } finally {
            setIsPaying(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setPaymentError(response.error?.description || "Payment was unsuccessful. Please try again.");
        setIsPaying(false);
      });
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || "Payment could not be started.");
      setIsPaying(false);
    }
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
              Thanks for Choosing Us!
            </h3>
            <p className="text-sm text-[#4f443f] max-w-md mx-auto">
              We have received your booking and <strong>we will contact you soon</strong>. A confirmation email has been sent to{" "}
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
                {confirmedBooking.paymentStatus === "paid" && confirmedBooking.meetingLink ? (
                  <a
                    href={confirmedBooking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1B5E20] font-semibold underline block mt-0.5"
                  >
                    Join Google Meet →
                  </a>
                ) : (
                  <span className="text-[11px] text-[#705d00] block mt-0.5 font-medium">
                    Meeting details will be shared after payment confirmation
                  </span>
                )}
                {confirmedBooking.price && (
                  <span className="text-[11px] text-[#82746f] block mt-0.5">
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

          {/* PAYMENT RECEIPT / CONFIRMATION CARD */}
          {confirmedBooking.paymentStatus === "paid" ? (
            <div className="rounded-2xl p-5 sm:p-6 border text-left space-y-2.5 transition-all duration-300 bg-white border-[#e2d9ce] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Payment Verified via Razorpay</span>
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Paid ₹{confirmedBooking.price?.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-xs text-[#5a4033] leading-relaxed">
                Your appointment is confirmed and consultation fee has been settled. Razorpay Payment ID:{" "}
                <code className="bg-[#f6f3ec] px-1.5 py-0.5 rounded font-mono text-[11px] text-[#1A3828] font-semibold">
                  {confirmedBooking.razorpayPaymentId || "rzp_paid"}
                </code>
              </p>

              {/* Google Meet room ready banner */}
              {confirmedBooking.meetingLink && confirmedBooking.meetingLink.startsWith("http") && (
                <div className="pt-3 border-t border-[#e2d9ce]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Google Meet Session Ready</span>
                    </span>
                    <p className="text-xs text-[#5a4033] mt-0.5">
                      Your consultation link has been generated:
                    </p>
                    <a
                      href={confirmedBooking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 font-semibold underline block mt-0.5 break-all"
                    >
                      {confirmedBooking.meetingLink}
                    </a>
                  </div>
                  <a
                    href={confirmedBooking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                  >
                    <span>Join Google Meet</span>
                    <span>→</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl p-5 sm:p-6 border text-left space-y-2.5 transition-all duration-300 bg-white border-[#e2d9ce] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" />
                  <span>Session Confirmed · Settle Later</span>
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  ₹{confirmedBooking.price?.toLocaleString("en-IN")} Due at Session
                </span>
              </div>
              <p className="text-xs text-[#5a4033] leading-relaxed">
                {config.paymentDisabledNote ||
                  "Your appointment slot has been reserved. You can settle the consultation fee online prior to or during your consultation."}
              </p>
            </div>
          )}

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
      ref={formTopRef}
      className={`w-full max-w-5xl mx-auto rounded-3xl bg-[#fcf9f2] border border-[#e2d9ce] p-6 sm:p-10 lg:p-12 shadow-[0_8px_40px_rgba(65,42,30,0.06)] text-[#1c1c18] ${className}`}
    >
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e2d9ce]">
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

      {/* STEPPER PROGRESS BAR */}
      <div className="py-6 border-b border-[#e2d9ce]/80">
        {/* Mobile View: Progress Bar & Current Step Title */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#705d00] uppercase tracking-wider text-[11px]">
              Step {currentStep} of 5
            </span>
            <span className="font-medium text-[#412a1e]">
              {currentStep === 1 && "Session Format"}
              {currentStep === 2 && "Date & Time"}
              {currentStep === 3 && "Your Details"}
              {currentStep === 4 && "Before Session"}
              {currentStep === 5 && "Confirm & Pay"}
            </span>
          </div>
          <div className="w-full bg-[#e8e2d7] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#705d00] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop / Tablet View: 5 Steps with connecting indicators */}
        <div className="hidden sm:flex items-center justify-between">
          {[
            { num: 1 as const, label: "Session Format" },
            { num: 2 as const, label: "Date & Time" },
            { num: 3 as const, label: "Your Details" },
            { num: 4 as const, label: "Before Session" },
            { num: 5 as const, label: "Confirm & Pay" },
          ].map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            const isClickable = step.num <= currentStep;

            return (
              <div
                key={step.num}
                className="flex items-center flex-1 last:flex-none"
              >
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && goToStep(step.num)}
                  className={`flex items-center gap-2.5 text-left transition-all ${
                    isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCompleted
                        ? "bg-[#705d00] text-white"
                        : isCurrent
                        ? "bg-[#412a1e] text-[#fcf9f2] ring-4 ring-[#705d00]/20 shadow-sm"
                        : "bg-[#e8e2d7] text-[#82746f]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-semibold transition-colors ${
                        isCurrent
                          ? "text-[#412a1e]"
                          : isCompleted
                          ? "text-[#705d00]"
                          : "text-[#82746f]"
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[10px] text-[#82746f]">
                      {isCompleted ? "Completed" : isCurrent ? "Active step" : "Upcoming"}
                    </div>
                  </div>
                </button>

                {idx < 4 && (
                  <div className="flex-1 mx-3 h-[2px] bg-[#e2d9ce] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? "bg-[#705d00] w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 pt-6">
        {/* ============================================================ */}
        {/* STEP 1: CHOOSE CLINICAL SERVICE & FORMAT                     */}
        {/* ============================================================ */}
        {currentStep === 1 && (
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
                    onClick={() => handleSelectService(svc)}
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

            {/* Step 1 Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e2d9ce]/60">
              <span className="text-xs text-[#82746f]">
                {selectedService
                  ? `Selected: ${selectedService.name} (₹${selectedService.price?.toLocaleString("en-IN")})`
                  : "Tap a consultation area above to select and continue."}
              </span>
              <button
                type="button"
                disabled={!selectedService}
                onClick={handleNextStep}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#412a1e] text-[#fcf9f2] text-sm font-semibold hover:bg-[#5a4033] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue to Date &amp; Time</span>
                <ArrowRight className="w-4 h-4 text-[#F4D242]" />
              </button>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* STEP 2: CHOOSE PREFERRED DATE & TIME                         */}
        {/* ============================================================ */}
        {currentStep === 2 && (
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
                    const isLeaveDay = !!(
                      dayOverride?.isOffDay ||
                      (dayOverride && Array.isArray(dayOverride.slots) && dayOverride.slots.length === 0) ||
                      (config.blockedSlots &&
                        config.blockedSlots.some(
                          (b) =>
                            b.date === itemDateStr &&
                            (b.type === "full_day" || b.type === "all_day" || b.type === "holiday")
                        ))
                    );
                    const hasCustomSingleDaySlots = !!(
                      dayOverride &&
                      dayOverride.slots &&
                      dayOverride.slots.length > 0 &&
                      !dayOverride.isOffDay
                    );
                    const isStrictScheduledOnly = config.onlyScheduledSlots !== false;
                    const isScheduledDay = hasCustomSingleDaySlots || (!isStrictScheduledOnly && (config.timeSlots || TIME_SLOTS).length > 0);
                    const dayCandidateSlots = hasCustomSingleDaySlots
                      ? (dayOverride?.slots || [])
                      : (!isStrictScheduledOnly ? (config.timeSlots || TIME_SLOTS) : []);
                    const isAvailable =
                      item.isCurrentMonth &&
                      !past &&
                      !isLeaveDay &&
                      isScheduledDay &&
                      dayCandidateSlots.some((s) => !isSlotBookedOrBlocked(itemDateStr, s.time));
                    const isFullyBooked =
                      !isLeaveDay &&
                      !past &&
                      item.isCurrentMonth &&
                      isScheduledDay &&
                      dayCandidateSlots.length > 0 &&
                      !isAvailable;
                    const isUnscheduled =
                      item.isCurrentMonth && !past && !isLeaveDay && !isScheduledDay;

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
                        title={
                          isLeaveDay
                            ? `${itemDateStr}: Therapist on Leave · No Slots Available`
                            : isFullyBooked
                            ? `${itemDateStr}: All Consultation Slots Booked`
                            : isUnscheduled
                            ? `${itemDateStr}: There is no slot scheduled`
                            : `${itemDateStr}: Scheduled Slots Available`
                        }
                        className={`relative h-10 w-full rounded-lg flex flex-col items-center justify-center text-xs transition-all font-medium ${
                          !item.isCurrentMonth
                            ? "text-[#82746f]/30 cursor-default"
                            : past
                            ? "text-[#82746f]/40 cursor-not-allowed"
                            : isSelected
                            ? isLeaveDay
                              ? "bg-rose-800 text-white font-semibold shadow-sm ring-2 ring-rose-400"
                              : isFullyBooked
                              ? "bg-[#6b584e] text-white font-semibold shadow-sm ring-2 ring-[#a8988e]"
                              : isUnscheduled
                              ? "bg-[#5a4a42] text-white font-semibold shadow-sm ring-2 ring-[#8c7d75]"
                              : "bg-[#412a1e] text-[#fcf9f2] font-semibold shadow-sm"
                            : isLeaveDay
                            ? "text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/70 cursor-pointer"
                            : isFullyBooked
                            ? "text-[#82746f] bg-[#ede8e1]/60 hover:bg-[#e4ded6] border border-[#d8d0c5] cursor-pointer"
                            : isAvailable
                            ? "text-[#1c1c18] font-semibold hover:bg-[#e5e2db]/80 cursor-pointer"
                            : "text-[#82746f]/70 hover:bg-[#e5e2db]/50 cursor-pointer"
                        }`}
                      >
                        <span>{item.day}</span>
                        {/* Dot indicator for available scheduled days */}
                        {isAvailable && !isSelected && (
                          <span
                            className="w-1.5 h-1.5 rounded-full absolute bottom-1 bg-[#F4D242] ring-1 ring-[#705d00]"
                            title="Slots Available"
                          ></span>
                        )}
                        {/* Dot indicator for fully booked days */}
                        {isFullyBooked && item.isCurrentMonth && !past && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full absolute bottom-1 bg-[#8c7d75]" title="Fully Booked"></span>
                        )}
                        {/* Dot indicator for leave days */}
                        {isLeaveDay && item.isCurrentMonth && !past && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full absolute bottom-1 bg-rose-500" title="On Leave"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Legend */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-6 mt-6 border-t border-[#e2d9ce]/60 text-[11px] text-[#82746f]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#412a1e] inline-block"></span>
                  <span>Selected Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F4D242] ring-1 ring-[#705d00] inline-block"></span>
                  <span>Scheduled Slots</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8c7d75] inline-block"></span>
                  <span className="text-[#8c7d75] font-medium">Fully Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span className="text-rose-700 font-medium">On Leave (No Slots)</span>
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

                {/* Single Day Custom Hours Banner (when working) */}
                {activeSingleDayOverride && !isDateOnLeave && (
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

                {/* IF ON LEAVE OR NO SLOTS: EMPATHETIC NOTICE CARD */}
                {isDateOnLeave || candidateTimeSlots.length === 0 || activeTimeSlots.length === 0 ? (
                  <div className="rounded-2xl bg-[#fff5f5] border border-rose-200 p-6 text-center space-y-4 my-auto">
                    <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-700 shadow-xs">
                      <CalendarOff className="w-6 h-6 text-rose-600" />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full inline-block border border-rose-200">
                        {isDateOnLeave
                          ? "Therapist On Leave"
                          : isAllSlotsBooked
                          ? "Fully Booked"
                          : "There Is No Slot"}
                      </span>
                      <h4 className="font-serif text-lg font-medium text-[#412a1e]">
                        {isDateOnLeave
                          ? "No Consultation Slots Available"
                          : isAllSlotsBooked
                          ? "All Consultation Slots Booked"
                          : "There is no slot available for this date"}
                      </h4>
                      <p className="text-xs text-[#5a4033] max-w-xs mx-auto leading-relaxed">
                        {activeSingleDayOverride?.leaveReason || activeSingleDayOverride?.note
                          ? `Notice: ${activeSingleDayOverride.leaveReason || activeSingleDayOverride.note}`
                          : isDateOnLeave
                          ? "Aswathy is away on leave on this date. No consultation slots are available."
                          : isAllSlotsBooked
                          ? "All consultation slots for this date have already been reserved by other clients. Please choose another date or tap below to jump to the next available opening."
                          : "There are no consultation slots scheduled for this date. Only dates with an active clinical schedule are open for booking."}
                      </p>
                      <p className="text-[11px] text-[#82746f] pt-1">
                        Please choose another open date from the calendar, or tap below:
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleJumpToNextAvailableDate}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#412a1e] text-[#fcf9f2] text-xs font-semibold hover:bg-[#5a4033] transition-all cursor-pointer shadow-xs mx-auto"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[#F4D242]" />
                      <span>Select Next Available Date</span>
                    </button>
                  </div>
                ) : (
                  /* Slots Grid: only scheduled slots display; booked slots clearly marked with "No slot (Booked)" */
                  <div className="grid grid-cols-2 gap-2.5">
                    {candidateTimeSlots.map((slot) => {
                      const isBooked = isSlotBookedOrBlocked(selectedDateStr, slot.time);
                      const isSelected = selectedTime === slot.time;

                      if (isBooked) {
                        return (
                          <div
                            key={slot.time}
                            className={`${
                              slot.isEvening ? "col-span-2" : "col-span-1"
                            } py-2.5 px-3 rounded-xl text-xs font-medium text-center border bg-[#eae5dc]/60 border-[#d8d0c5] text-[#82746f] cursor-not-allowed flex items-center justify-center gap-2 select-none opacity-80`}
                            title={`${slot.time} is already reserved`}
                          >
                            <span className="line-through">{slot.time}</span>
                            <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#d8d0c5]/80 text-[#5a4033]">
                              No slot
                            </span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedTime(slot.time)}
                          className={`${
                            slot.isEvening ? "col-span-2" : "col-span-1"
                          } py-2.5 px-3 rounded-xl text-xs font-medium transition-all text-center border cursor-pointer ${
                            isSelected
                              ? "bg-[#F4D242] border-[#F4D242] text-[#221b00] font-semibold shadow-sm ring-1 ring-[#705d00]/30"
                              : "bg-[#f6f3ec] hover:bg-[#ece8df] border-[#e2d9ce] text-[#412a1e]"
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
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

          {/* Step 2 Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e2d9ce]/60">
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f6f3ec] text-[#412a1e] border border-[#e2d9ce] text-sm font-semibold hover:bg-[#ece8df] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Session Format</span>
            </button>

            <button
              type="button"
              disabled={isDateOnLeave || activeTimeSlots.length === 0 || !selectedTime}
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#412a1e] text-[#fcf9f2] text-sm font-semibold hover:bg-[#5a4033] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue to Your Details</span>
              <ArrowRight className="w-4 h-4 text-[#F4D242]" />
            </button>
          </div>
        </section>
      )}

        {/* ============================================================ */}
        {/* STEP 3: YOUR CONFIDENTIAL INFORMATION                        */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#412a1e] text-[#fcf9f2] text-xs font-semibold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#412a1e] font-normal">
                  {config.step3Title || "Your Confidential Information"}
                </h3>
                <p className="text-xs text-[#82746f] mt-0.5">
                  Your privacy is fully protected under clinical confidentiality standards.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Selected Service Summary Pill */}
              {selectedService && (
                <div className="bg-[#f6f3ec] rounded-2xl p-4 sm:p-5 border border-[#e2d9ce] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#705d00] block mb-1">
                      Selected Appointment
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
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
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
                    placeholder="+91 755 000 2973"
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

            {/* Validation error if any */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs">
                {errorMessage}
              </div>
            )}

            {/* Step 3 Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e2d9ce]/60">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f6f3ec] text-[#412a1e] border border-[#e2d9ce] text-sm font-semibold hover:bg-[#ece8df] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Date &amp; Time</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#412a1e] text-[#fcf9f2] text-sm font-semibold hover:bg-[#5a4033] transition-all cursor-pointer shadow-md"
              >
                <span>Continue to Session Guidelines</span>
                <ArrowRight className="w-4 h-4 text-[#F4D242]" />
              </button>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* STEP 4: IMPORTANT INFORMATION BEFORE SESSION                 */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#412a1e] text-[#fcf9f2] text-xs font-semibold flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#412a1e] font-normal">
                  Important Information Before Session
                </h3>
                <p className="text-xs text-[#82746f] mt-0.5">
                  Please review the telehealth consultation guidelines and clinical protocols.
                </p>
              </div>
            </div>

            {/* IMPORTANT PRACTICE NOTICE / CLINICAL GUIDELINES */}
            {config.noticeBox?.enabled && config.noticeBox?.message && (
              <div className="space-y-4">
                {/* Header Card */}
                <div
                  role="region"
                  aria-label="Practice Notice"
                  className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    config.noticeBox.type === "warning"
                      ? "bg-[#fff7ed] border-[#fed7aa] text-[#7c2d12]"
                      : config.noticeBox.type === "info"
                      ? "bg-[#eff6ff] border-[#bfdbfe] text-[#1e3a8a]"
                      : config.noticeBox.type === "success"
                      ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#14532d]"
                      : "bg-[#fbf7ee] border-[#e2d9ce] text-[#412a1e]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        config.noticeBox.type === "warning"
                          ? "bg-[#ffedd5] text-[#c2410c]"
                          : config.noticeBox.type === "info"
                          ? "bg-[#dbeafe] text-[#2563eb]"
                          : config.noticeBox.type === "success"
                          ? "bg-[#dcfce7] text-[#16a34a]"
                          : "bg-[#faecd6] text-[#705d00]"
                      }`}
                    >
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#412a1e]">
                        {config.noticeBox.title || "Important Information Before Booking"}
                      </h4>
                      <p className="text-xs text-[#82746f] mt-0.5">
                        Please review these {parsedNoticePoints.length} guidelines before confirming your session.
                      </p>
                    </div>
                  </div>

                  {parsedNoticePoints.length > 0 && (
                    <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-white/80 border border-[#e2d9ce] text-[#705d00] text-[11px] font-semibold tracking-wide">
                      {parsedNoticePoints.length} Points to Note
                    </span>
                  )}
                </div>

                {/* Individual Responsive Numbered Rule Cards */}
                {parsedNoticePoints.length > 1 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                    {parsedNoticePoints.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e5decb] hover:border-[#705d00]/40 transition-all shadow-[0_2px_8px_rgba(65,42,30,0.03)] flex items-start gap-3 group"
                      >
                        <span className="w-6 h-6 rounded-full bg-[#f4ece0] text-[#705d00] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#e2d9ce] group-hover:bg-[#705d00] group-hover:text-white transition-colors">
                          {item.num}
                        </span>
                        <p className="text-xs sm:text-[13px] text-[#3a281e] leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white border border-[#e2d9ce] text-xs sm:text-sm text-[#412a1e] leading-relaxed whitespace-pre-line">
                    {config.noticeBox.message}
                  </div>
                )}
              </div>
            )}

            {/* If noticeBox is NOT enabled, fallback to the 4 default guidelines cards */}
            {(!config.noticeBox?.enabled || !config.noticeBox?.message) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#f6f3ec] border border-[#e2d9ce] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#412a1e]">
                    <Video className="w-4 h-4 text-[#705d00]" />
                    <span>100% Online via Google Meet</span>
                  </div>
                  <p className="text-[11px] text-[#5a4033] leading-relaxed">
                    Your private video consultation link will be dispatched via email and WhatsApp upon confirmation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f6f3ec] border border-[#e2d9ce] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#412a1e]">
                    <Lock className="w-4 h-4 text-[#705d00]" />
                    <span>Confidential &amp; Private Space</span>
                  </div>
                  <p className="text-[11px] text-[#5a4033] leading-relaxed">
                    Please attend your session from a quiet, private location where you feel comfortable speaking freely without interruptions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f6f3ec] border border-[#e2d9ce] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#412a1e]">
                    <Clock className="w-4 h-4 text-[#705d00]" />
                    <span>Punctuality &amp; Cadence</span>
                  </div>
                  <p className="text-[11px] text-[#5a4033] leading-relaxed">
                    Please join 2-3 minutes ahead of your slot. Each session spans 50 minutes with an unhurried integration closing.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f6f3ec] border border-[#e2d9ce] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#412a1e]">
                    <ShieldCheck className="w-4 h-4 text-[#705d00]" />
                    <span>Rescheduling Policy</span>
                  </div>
                  <p className="text-[11px] text-[#5a4033] leading-relaxed">
                    To reschedule or cancel your session, please notify at least 24 hours prior to your scheduled time via WhatsApp or email.
                  </p>
                </div>
              </div>
            )}

            {/* Interactive acknowledgement checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#f6f3ec] border border-[#e2d9ce] cursor-pointer hover:border-[#705d00]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={guidelinesAccepted}
                  onChange={(e) => {
                    setGuidelinesAccepted(e.target.checked);
                    if (e.target.checked) setErrorMessage("");
                  }}
                  className="mt-1 w-4 h-4 rounded border-[#e2d9ce] text-[#705d00] focus:ring-[#705d00] cursor-pointer"
                />
                <span className="text-xs text-[#412a1e] leading-relaxed">
                  I have read and acknowledged the session guidelines, telehealth protocol, and agree to the consultation policies.
                </span>
              </label>
            </div>

            {/* Validation error if any */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs">
                {errorMessage}
              </div>
            )}

            {/* Step 4 Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e2d9ce]/60">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f6f3ec] text-[#412a1e] border border-[#e2d9ce] text-sm font-semibold hover:bg-[#ece8df] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Your Details</span>
              </button>

              <button
                type="button"
                disabled={!guidelinesAccepted}
                onClick={handleNextStep}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#412a1e] text-[#fcf9f2] text-sm font-semibold hover:bg-[#5a4033] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Confirm &amp; Pay</span>
                <ArrowRight className="w-4 h-4 text-[#F4D242]" />
              </button>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* STEP 5: CONFIRM & PAY                                        */}
        {/* ============================================================ */}
        {currentStep === 5 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#412a1e] text-[#fcf9f2] text-xs font-semibold flex items-center justify-center shrink-0">
                5
              </span>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#412a1e] font-normal">
                  Confirm &amp; Pay
                </h3>
                <p className="text-xs text-[#82746f] mt-0.5">
                  Review your consultation details and complete your reservation.
                </p>
              </div>
            </div>

            {/* Booking Details Review Card */}
            <div className="rounded-2xl border border-[#e2d9ce] bg-[#f6f3ec]/80 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#e2d9ce]/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#705d00]">
                  Consultation Summary
                </span>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs text-[#705d00] hover:text-[#412a1e] font-medium underline cursor-pointer"
                >
                  Change Service
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#82746f] block mb-0.5">
                    Service
                  </span>
                  <p className="font-semibold text-sm text-[#412a1e]">
                    {selectedService?.name}
                  </p>
                  <p className="text-[11px] text-[#82746f]">
                    {selectedService?.categoryName} · {selectedService?.durationMinutes} mins
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#82746f] block mb-0.5">
                    Appointment Date &amp; Time
                  </span>
                  <p className="font-semibold text-sm text-[#412a1e]">
                    {selectedDateStr} at {selectedTime}
                  </p>
                  <p className="text-[11px] text-[#82746f]">
                    Online Telehealth (Google Meet)
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#82746f] block mb-0.5">
                    Client Information
                  </span>
                  <p className="font-semibold text-sm text-[#412a1e]">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-[#82746f]">
                    {email} · {phone || "No phone"} ({contactChannel})
                  </p>
                </div>
              </div>

              {notes && (
                <div className="pt-3 border-t border-[#e2d9ce]/60 text-xs">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#82746f] block mb-0.5">
                    Pre-session Notes
                  </span>
                  <p className="text-[#5a4033] italic leading-relaxed">
                    &ldquo;{notes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Payment Mode Notice */}
            {config.enablePayment !== false ? (
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-[#1A3828] text-xs flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="font-semibold text-emerald-950">Secure Razorpay Online Checkout</p>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Total: ₹{(selectedService?.price || 1800).toLocaleString("en-IN")} · Instant Confirmation
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#5a4033]">
                    Seamless payment via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, or NetBanking. You will complete payment via Razorpay upon clicking submit.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-[#5a4033] text-xs flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="font-semibold text-[#1A3828]">Manual Payment Settlement</p>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Status: {config.defaultPaymentStatus === "paid" ? "Marked as Paid" : "Pay Later / At Session"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#5a4033]">
                    {config.manualPaymentInstructions ||
                      config.paymentDisabledNote ||
                      "Your booking will be reserved instantly. You can settle the consultation fee online prior to or during your consultation."}
                  </p>
                </div>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs">
                {errorMessage}
              </div>
            )}

            {/* Step 5 Bottom Action Bar */}
            <div className="pt-6 border-t border-[#e2d9ce] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f6f3ec] text-[#412a1e] border border-[#e2d9ce] text-sm font-semibold hover:bg-[#ece8df] transition-all cursor-pointer order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Guidelines</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto order-1 sm:order-2">
                <div className="flex flex-col gap-0.5 text-xs text-[#5a4033] text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F4D242] inline-block animate-pulse"></span>
                    <span>{config.instantConfirmationText || "Meeting details will be shared after payment confirmation"}</span>
                  </div>
                  <p className="text-[10px] text-[#82746f]">
                    By booking, you agree to our{" "}
                    <Link href="/terms-and-conditions" target="_blank" className="underline hover:text-[#412a1e]">
                      Terms
                    </Link>{" "}
                    &amp;{" "}
                    <Link href="/privacy-policy" target="_blank" className="underline hover:text-[#412a1e]">
                      Privacy Policy
                    </Link>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isDateOnLeave ||
                    activeTimeSlots.length === 0 ||
                    !selectedTime
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#412a1e] text-[#fcf9f2] text-sm font-semibold hover:bg-[#5a4033] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>
                      {config.enablePayment === false
                        ? "Securing Appointment..."
                        : "Connecting to Razorpay..."}
                    </span>
                  ) : isDateOnLeave || activeTimeSlots.length === 0 ? (
                    <span className="flex items-center gap-2 text-rose-200">
                      <CalendarOff className="w-4 h-4 text-rose-300" />
                      <span>
                        {isDateOnLeave
                          ? "No Slots Available (On Leave)"
                          : isAllSlotsBooked
                          ? "All Slots Booked"
                          : "There Is No Slot"}
                      </span>
                    </span>
                  ) : (
                    <>
                      <span>
                        {config.enablePayment === false
                          ? (config.submitButtonText && !config.submitButtonText.toLowerCase().includes("razorpay")
                              ? config.submitButtonText
                              : "Confirm & Book Session (Pay Later)")
                          : (config.submitButtonText &&
                             !config.submitButtonText.toLowerCase().includes("pay later") &&
                             config.submitButtonText !== "Confirm & Request Session"
                              ? config.submitButtonText
                              : `Pay via Razorpay & Book Session (₹${(selectedService?.price || 1800).toLocaleString("en-IN")})`)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#F4D242]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}
