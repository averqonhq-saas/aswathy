// Pure TypeScript interfaces and types for client and server usage.
// DO NOT import server-only modules (fs, path, pg, next/headers) here.

export * from "./booking-config";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "superadmin" | "practitioner";
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  durationMinutes: number;
  price: number;
  image: string;
  status: "active" | "disabled";
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BookingHistoryItem {
  timestamp: string;
  action: string;
  note?: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string; // YYYY-MM-DD
  date?: string; // alias for appointmentDate
  appointmentTime: string; // e.g. "11:30 AM"
  time?: string; // alias for appointmentTime
  durationMinutes: number;
  format: "online" | "in-person";
  modality?: "online" | "in-person"; // alias for format
  bookingStatus: "pending" | "confirmed" | "completed" | "cancelled";
  status?: "pending" | "confirmed" | "completed" | "cancelled"; // alias for bookingStatus
  paymentStatus: "pending" | "paid" | "refunded";
  price?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  meetingLink?: string;
  calendarEventId?: string;
  googleEventId?: string;
  whatsappStatus?: string;
  clientMessage?: string;
  clientNotes?: string; // alias for clientMessage
  internalNotes?: string;
  history: BookingHistoryItem[];
  provider: "internal";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AvailabilityRule {
  id: string;
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
    | number;
  isWorking: boolean;
  isActive?: boolean; // alias for isWorking
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  breakStart?: string; // "13:00"
  breakEnd?: string; // "14:00"
  sessionDuration?: number; // 50
  bufferTime?: number; // 15
  createdAt: string;
  updatedAt: string;
}

export interface BlockedSlot {
  id: string;
  title: string;
  type: "slot" | "full_day" | "holiday" | "all_day";
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "contacted" | "follow_up" | "resolved";
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ClientFeedback {
  id: string;
  clientDisplayName: string;
  feedback: string;
  rating: number; // 1 to 5
  date: string;
  isAnonymous: boolean;
  status: "pending" | "approved" | "hidden";
  publicVisibility: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface WebsiteAboutContent {
  name: string;
  title: string;
  shortIntro: string;
  fullBio: string;
  experienceYears: string;
  qualifications: string[];
  profileImage: string;
  updatedAt: string;
}

export interface JourneyEntry {
  id: string;
  year: string;
  heading: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionStep {
  id: string;
  stepNumber: string; // "01", "02"
  title: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientType {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  title: string;
  url: string;
  category: "profile" | "service" | "website" | "testimonial";
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type:
    | "booking_new"
    | "booking_cancel"
    | "booking_cancelled"
    | "booking_rescheduled"
    | "enquiry_new"
    | "feedback_new"
    | "status_change";
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export type Notification = NotificationItem;

export interface PracticeSettings {
  general: {
    websiteName: string;
    practiceName?: string;
    tagline?: string;
    email: string;
    contactEmail?: string;
    phone: string;
    contactPhone?: string;
    clinicAddress: string;
    instagram: string;
    linkedin: string;
    whatsapp: string;
    currency?: string;
    timezone?: string;
  };
  booking: {
    defaultSessionDuration: number;
    bufferTime: number;
    bufferTimeMinutes?: number;
    advanceNoticeHours?: number;
    maxAdvanceDays?: number;
    cancellationNoticeHours: number;
    cancellationPolicyHours?: number;
    confirmationMessage: string;
    defaultFormat: "online" | "in-person";
    requireApproval?: boolean;
    slotDurationMinutes?: number;
    enablePayment?: boolean;
  };
  account: {
    adminName: string;
    email: string;
    profileImage: string;
  };
  notifications: {
    emailNotifications: boolean;
    bookingAlerts: boolean;
    enquiryAlerts: boolean;
    feedbackAlerts: boolean;
    emailOnBooking?: boolean;
    emailOnEnquiry?: boolean;
    dailySummaryDigest?: boolean;
  };
}

export interface DatabaseSchema {
  admins: AdminUser[];
  serviceCategories: ServiceCategory[];
  services: Service[];
  bookings: Booking[];
  availability: AvailabilityRule[];
  blockedSlots: BlockedSlot[];
  enquiries: Enquiry[];
  feedback: ClientFeedback[];
  websiteAbout: WebsiteAboutContent;
  journeyEntries: JourneyEntry[];
  sessionSteps: SessionStep[];
  sessionFormats?: import("./booking-config").SessionFormat[];
  bookingFormConfig?: import("./booking-config").BookingFormConfig;
  clientTypes: ClientType[];
  media: MediaItem[];
  notifications: NotificationItem[];
  settings: PracticeSettings;
}
