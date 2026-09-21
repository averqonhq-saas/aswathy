export interface SessionFormat {
  id: string;
  title: string;
  format: "online" | "in-person";
  duration: string;
  tag: string;
  badge?: string;
  badgeType?: "popular" | "in-person" | "introductory";
  description: string;
  icon: "video" | "studio" | "discovery";
  price?: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingTimeSlot {
  time: string;
  isEvening: boolean;
}

export interface TimeBreak {
  id?: string;
  from: string; // e.g. "13:00" or "01:00 PM"
  to: string; // e.g. "14:00" or "02:00 PM"
  label?: string; // e.g. "Lunch Break", "Tea & Rest", "Admin Reflection"
}

export interface SingleDaySlotOverride {
  id: string;
  date: string; // "YYYY-MM-DD"
  fromTime?: string; // e.g. "10:00 AM" or "10:00"
  toTime?: string; // e.g. "06:00 PM" or "18:00"
  slotDurationMinutes?: number;
  note?: string; // e.g. "Special Weekend Clinic", "Evening Slots"
  breaks?: TimeBreak[];
  isOffDay?: boolean; // If true, marked as unavailable for booking on this date (On Leave)
  leaveReason?: string; // Reason or label for leave, e.g. "Personal Leave", "Public Holiday"
  slots: BookingTimeSlot[];
}

export interface BookingNoticeBox {
  enabled: boolean;
  title?: string;
  message: string;
  type?: "info" | "warning" | "announcement" | "success";
}

export interface BookingFormConfig {
  headerBadge: string;
  headerTitle: string;
  securityBadge: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  timezone: string;
  cadenceTitle: string;
  cadenceDescription: string;
  timeSlots: BookingTimeSlot[];
  singleDaySlots?: SingleDaySlotOverride[];
  blockedSlots?: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
  }>;
  contactChannels: string[];
  ethicsNotice: string;
  instantConfirmationText: string;
  submitButtonText: string;
  whatsappNumber: string;
  confirmationTitle: string;
  confirmationSubtitle: string;
  enablePayment?: boolean; // When true, client pays online via Razorpay. When false, direct booking with pay later.
  paymentDisabledNote?: string;
  defaultPaymentStatus?: "pending" | "paid"; // Default status when online payment is disabled
  manualPaymentInstructions?: string; // Instructions for client on manual settlement
  noticeBox?: BookingNoticeBox; // Client-facing announcement/notice banner on booking form
  onlyScheduledSlots?: boolean; // When true (default), only explicit Day Schedule slots are shown in booking; unscheduled dates show "There is no slot".
  updatedAt: string;
}

export const DEFAULT_SESSION_FORMATS: SessionFormat[] = [
  {
    id: "individual-online",
    title: "Individual Online Counselling",
    format: "online",
    duration: "50 Minutes · Secure Video",
    tag: "Video Consultation",
    badge: "Popular",
    badgeType: "popular",
    description:
      "Consult from your personal sanctuary via secure private link. Flexible, discreet, and gentle.",
    icon: "video",
    price: 1800,
    order: 1,
    isActive: true,
    createdAt: "2026-09-06T13:18:50.470Z",
    updatedAt: "2026-09-06T13:18:50.470Z",
  },
  {
    id: "initial-discovery",
    title: "Initial Discovery Call",
    format: "online",
    duration: "20 Minutes · Introductory",
    tag: "Exploratory",
    badge: "Introductory",
    badgeType: "introductory",
    description:
      "A gentle, low-pressure introduction to share your hopes, ask questions, and see if we are a good fit.",
    icon: "discovery",
    price: 0,
    order: 2,
    isActive: true,
    createdAt: "2026-09-06T13:18:50.470Z",
    updatedAt: "2026-09-06T13:18:50.470Z",
  },
];

export const DEFAULT_BOOKING_FORM_CONFIG: BookingFormConfig = {
  headerBadge: "Live Scheduling Sanctuary",
  headerTitle: "Select your consultation preference",
  securityBadge: "Encrypted Healthcare Schedule",
  step1Title: "Choose Session Format",
  step2Title: "Choose Preferred Date & Time",
  step3Title: "Your Confidential Information",
  timezone: "IST (GMT+5:30)",
  cadenceTitle: "50-Minute Gentle Cadence",
  cadenceDescription:
    "All sessions conclude with 10 minutes of integration buffer to keep conversations unhurried.",
  timeSlots: [
    { time: "10:00 AM", isEvening: false },
    { time: "11:30 AM", isEvening: false },
    { time: "02:00 PM", isEvening: false },
    { time: "04:00 PM", isEvening: false },
    { time: "05:30 PM (Evening Slot)", isEvening: true },
  ],
  contactChannels: [
    "Email Invitation & Encrypted Link",
    "WhatsApp & Email Notification",
    "Direct Phone Call",
  ],
  ethicsNotice:
    "All communications are bound by strict psychological ethics and confidential data protocols.",
  instantConfirmationText:
    "Meeting details will be shared after payment confirmation",
  submitButtonText: "Confirm & Request Session",
  whatsappNumber: "+91 755 000 2973",
  confirmationTitle: "Your Sanctuary Awaits",
  confirmationSubtitle: "Appointment Secured",
  enablePayment: true,
  defaultPaymentStatus: "pending",
  paymentDisabledNote: "No upfront payment required online. You may settle your consultation fee directly at the clinic or after your session.",
  manualPaymentInstructions: "You can settle your session fee directly via Cash or UPI (Google Pay, PhonePe, Paytm) upon arrival at the clinic or during your consultation.",
  singleDaySlots: [],
  onlyScheduledSlots: true,
  noticeBox: {
    enabled: false,
    title: "Important Clinic Notice",
    message: "",
    type: "announcement",
  },
  updatedAt: "2026-09-06T13:18:50.470Z",
};

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const is12Hour = /am|pm/i.test(timeStr);
  if (is12Hour) {
    const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3].toLowerCase();
    if (meridian === "pm" && hours < 12) hours += 12;
    if (meridian === "am" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  } else {
    const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
    return (h || 0) * 60 + (m || 0);
  }
}

export function formatMinutesTo12Hour(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const meridian = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const paddedH = String(hours12).padStart(2, "0");
  const paddedM = String(minutes).padStart(2, "0");
  return `${paddedH}:${paddedM} ${meridian}`;
}

export function generateSlotsFromRange(
  fromTime: string,
  toTime: string,
  slotDurationMinutes: number = 50,
  bufferMinutes: number = 10,
  breakFromOrBreaks?: string | TimeBreak[],
  breakTo?: string
): BookingTimeSlot[] {
  const startMin = parseTimeToMinutes(fromTime);
  const endMin = parseTimeToMinutes(toTime);
  if (startMin >= endMin) return [];

  const step = slotDurationMinutes + bufferMinutes;
  const slots: BookingTimeSlot[] = [];

  // Parse all breaks (supports array of TimeBreak OR single breakFrom / breakTo strings)
  const breakIntervals: Array<{ startMin: number; endMin: number }> = [];

  if (Array.isArray(breakFromOrBreaks)) {
    for (const b of breakFromOrBreaks) {
      if (b && b.from && b.to) {
        const bStart = parseTimeToMinutes(b.from);
        const bEnd = parseTimeToMinutes(b.to);
        if (bStart < bEnd) {
          breakIntervals.push({ startMin: bStart, endMin: bEnd });
        }
      }
    }
  } else if (typeof breakFromOrBreaks === "string" && breakTo) {
    const bStart = parseTimeToMinutes(breakFromOrBreaks);
    const bEnd = parseTimeToMinutes(breakTo);
    if (bStart < bEnd) {
      breakIntervals.push({ startMin: bStart, endMin: bEnd });
    }
  }

  let curr = startMin;
  while (curr + slotDurationMinutes <= endMin) {
    const overlapsBreak = breakIntervals.some(
      (b) => curr < b.endMin && curr + slotDurationMinutes > b.startMin
    );

    if (!overlapsBreak) {
      const timeStr = formatMinutesTo12Hour(curr);
      const isEvening = curr >= 17 * 60;
      slots.push({
        time: isEvening ? `${timeStr} (Evening Slot)` : timeStr,
        isEvening,
      });
    }

    curr += step;
  }

  return slots;
}

/**
 * Compares two time slot strings (e.g. "05:30 PM (Evening Slot)" vs "05:30 PM" vs "17:30")
 * to check if they represent the same appointment starting time.
 */
export function areSlotsMatching(time1: string, time2: string): boolean {
  if (!time1 || !time2) return false;
  const clean1 = time1.trim().toLowerCase();
  const clean2 = time2.trim().toLowerCase();
  if (clean1 === clean2) return true;
  const min1 = parseTimeToMinutes(time1);
  const min2 = parseTimeToMinutes(time2);
  return min1 === min2;
}

