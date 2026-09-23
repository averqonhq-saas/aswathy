import fs from "fs/promises";
import path from "path";
import { hashPassword } from "./auth";
import { loadDatabaseFromSupabase, saveDatabaseToSupabase, getPgPool } from "./supabase-db";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

// Export all data models & interfaces from pure client-safe types
export * from "./types";
import type { DatabaseSchema } from "./types";
import { DEFAULT_SESSION_FORMATS, DEFAULT_BOOKING_FORM_CONFIG } from "./booking-config";



// ==========================================
// SEED GENERATOR
// ==========================================

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function createInitialSeedData(): DatabaseSchema {
  const now = new Date().toISOString();
  const today = getTodayString();
  const tomorrow = getDateOffset(1);
  const inTwoDays = getDateOffset(2);
  const yesterday = getDateOffset(-1);
  const lastWeek = getDateOffset(-7);

  return {
    admins: [
      {
        id: "admin_aswathy_1",
        name: "Aswathy Jeyarajasekar",
        email: "roottherapyonline@gmail.com",
        passwordHash: hashPassword("admin12345"),
        role: "superadmin",
        profileImage:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
        createdAt: now,
        updatedAt: now,
      },
    ],
    serviceCategories: [
      {
        id: "cat_emotional",
        name: "Emotional Wellbeing",
        slug: "emotional-wellbeing",
        description:
          "Anxiety, depression, chronic stress regulation, emotional fatigue.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "cat_relationship",
        name: "Relationship & Interpersonal",
        slug: "relationship-interpersonal",
        description:
          "Boundaries, healthy communication, attachment exploration.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "cat_academic",
        name: "Academic & Career Growth",
        slug: "academic-career",
        description:
          "Performance anxiety, burnout, imposter feelings, exam pressure.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "cat_personal",
        name: "Personal Growth",
        slug: "personal-growth",
        description:
          "Self-worth, perfectionism, decision clarity, inner compass.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "cat_transitions",
        name: "Life Transitions",
        slug: "life-transitions",
        description:
          "Relocation, career transitions, grief, identity shifts.",
        createdAt: now,
        updatedAt: now,
      },
    ],
    services: [
      {
        id: "svc_emotional_wellbeing",
        name: "Emotional Wellbeing & Stress Management",
        categoryId: "cat_emotional",
        categoryName: "Emotional Wellbeing",
        shortDescription:
          "Navigating chronic anxiety, mood swings, somatic fatigue, and inner dialogue without harsh suppression.",
        fullDescription:
          "Emotional distress often signals unacknowledged needs. In this collaborative space, we gently explore physical sensations, emotional triggers, and personalized somatic grounding techniques at your pace.",
        durationMinutes: 50,
        price: 1800,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
        status: "active",
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "svc_personal_concerns",
        name: "Personal Concerns & Self-Compassion",
        categoryId: "cat_personal",
        categoryName: "Personal Growth",
        shortDescription:
          "Untangling perfectionism, imposter syndrome, decision paralysis, and self-esteem dread.",
        fullDescription:
          "Therapy provides an unhurried mirror to untangle who you are from who you were told you needed to be. Focus on gentle internal validation and healthy boundary development.",
        durationMinutes: 50,
        price: 1800,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
        status: "active",
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "svc_relationships",
        name: "Relationships & Interpersonal Dynamics",
        categoryId: "cat_relationship",
        categoryName: "Relationship & Interpersonal",
        shortDescription:
          "Healthy communication boundaries, family frictions, romantic attachment, and social anxiety.",
        fullDescription:
          "Relationships can be both our deepest solace and our greatest distress. Unpack attachment patterns, learn to communicate needs without crippling guilt, and establish safe boundaries.",
        durationMinutes: 50,
        price: 1800,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
        status: "active",
        order: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "svc_students_young_adults",
        name: "Student & Young Adult Support",
        categoryId: "cat_academic",
        categoryName: "Academic & Career Growth",
        shortDescription:
          "Support for college pressure, identity formation, career anxiety, and independence transitions.",
        fullDescription:
          "Dedicated holding space for students and young professionals navigating high expectations, exam burnout, family separation, and emerging adulthood.",
        durationMinutes: 50,
        price: 1500,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
        status: "active",
        order: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "svc_life_challenges",
        name: "Life Challenges & Phase Transitions",
        categoryId: "cat_transitions",
        categoryName: "Life Transitions",
        shortDescription:
          "Grief, major career shifts, relocation adjustment, and unexpected lifecycle disruptions.",
        fullDescription:
          "When life takes an unforeseen turn, having steady therapeutic accompaniment helps process grief, rebuild emotional anchors, and step forward with restored confidence.",
        durationMinutes: 50,
        price: 1800,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
        status: "active",
        order: 5,
        createdAt: now,
        updatedAt: now,
      },
    ],
    bookings: [],
    availability: [
      {
        id: "avail_mon",
        dayOfWeek: "monday",
        isWorking: true,
        startTime: "09:00",
        endTime: "18:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        sessionDuration: 50,
        bufferTime: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "avail_tue",
        dayOfWeek: "tuesday",
        isWorking: true,
        startTime: "09:00",
        endTime: "18:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        sessionDuration: 50,
        bufferTime: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "avail_wed",
        dayOfWeek: "wednesday",
        isWorking: true,
        startTime: "09:00",
        endTime: "18:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        sessionDuration: 50,
        bufferTime: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "avail_thu",
        dayOfWeek: "thursday",
        isWorking: true,
        startTime: "09:00",
        endTime: "18:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        sessionDuration: 50,
        bufferTime: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "avail_fri",
        dayOfWeek: "friday",
        isWorking: true,
        startTime: "09:00",
        endTime: "18:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        sessionDuration: 50,
        bufferTime: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "avail_sat",
        dayOfWeek: "saturday",
        isWorking: true,
        startTime: "10:00",
        endTime: "15:00",
        breakStart: "12:30",
        breakEnd: "13:00",
        sessionDuration: 50,
        bufferTime: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "avail_sun",
        dayOfWeek: "sunday",
        isWorking: false,
        startTime: "10:00",
        endTime: "14:00",
        breakStart: "12:00",
        breakEnd: "13:00",
        sessionDuration: 50,
        bufferTime: 15,
        createdAt: now,
        updatedAt: now,
      },
    ],
    blockedSlots: [],
    enquiries: [],
    feedback: [
      {
        id: "fb_1",
        clientDisplayName: "Client (Young Professional, 27)",
        feedback:
          "Aswathy provided such a calm, grounding presence when my anxiety felt overwhelming. She never pushed me to speak faster than I was ready to. For the first time in years, I felt genuinely heard.",
        rating: 5,
        date: "2025-01-14",
        isAnonymous: true,
        status: "approved",
        publicVisibility: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "fb_2",
        clientDisplayName: "Priya S.",
        feedback:
          "The collaborative approach made all the difference. Instead of giving generic advice, she helped me identify patterns in my relationships that I had ignored for years.",
        rating: 5,
        date: "2025-02-02",
        isAnonymous: false,
        status: "approved",
        publicVisibility: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "fb_3",
        clientDisplayName: "Post-Graduate Student",
        feedback:
          "Her grounding exercises during panic moments are practical and humane. I felt safe and deeply supported throughout our online sessions.",
        rating: 5,
        date: "2025-02-18",
        isAnonymous: true,
        status: "approved",
        publicVisibility: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    websiteAbout: {
      name: "Aswathy Jeyarajasekar",
      title: "Counselling Psychologist",
      shortIntro:
        "Providing an empathetic, collaborative sanctuary to explore your thoughts, emotions, and life challenges at your own pace.",
      fullBio:
        "I am a Counselling Psychologist dedicated to creating a non-judgmental, unhurried space for individuals traversing emotional fatigue, relationship distress, and personal growth. With over a year of active private practice under clinical supervision, my work integrates evidence-informed cognitive reflection with somatic grounding and person-centered warmth.",
      experienceYears: "1+ Year in Supervised Private Practice",
      qualifications: [
        "M.Sc. in Counselling Psychology",
        "B.Sc. in Psychology",
        "Trained in Person-Centered Therapy (PCT) & Somatic Grounding",
        "Clinical Supervision under Licensed Mental Health Practitioner",
      ],
      profileImage: "/aswathy-photo2.jpg",
      updatedAt: now,
    },
    journeyEntries: [
      {
        id: "jrn_1",
        year: "High School (11th Grade)",
        heading: "The Spark of Psychological Empathy",
        description:
          "My interest in psychology began in the 11th grade, sparked by a profound personal experience of receiving compassionate psychological support during a challenging life chapter.",
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "jrn_2",
        year: "Undergraduate Studies",
        heading: "B.Sc. in Psychology Foundations",
        description:
          "Built a rigorous foundation in human developmental psychology, abnormal psychology, cognitive neuroscience, and research methodologies.",
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "jrn_3",
        year: "Postgraduate Specialization",
        heading: "M.Sc. in Counselling Psychology",
        description:
          "Deepened clinical skills in person-centered modalities, therapeutic rapport, crisis intervention ethics, and supervised counselling practicum.",
        order: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "jrn_4",
        year: "Current Practice",
        heading: "Private Practice Sanctuary",
        description:
          "Established private counselling practice offering 100% online telehealth consultations under continued professional peer supervision.",
        order: 4,
        createdAt: now,
        updatedAt: now,
      },
    ],
    sessionSteps: [
      {
        id: "step_1",
        stepNumber: "01",
        title: "Initial Conversation",
        description:
          "A gentle, pressure-free dialogue to understand what brings you into therapy, clarify your hopes, and address any hesitations.",
        isActive: true,
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "step_2",
        stepNumber: "02",
        title: "Understanding Your Concerns",
        description:
          "Exploring your current emotional climate, daily stressors, relational dynamics, and internal narrative.",
        isActive: true,
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "step_3",
        stepNumber: "03",
        title: "Exploring Patterns and Needs",
        description:
          "Looking at recurrent cognitive and somatic patterns without blame, cultivating curiosity about your nervous system.",
        isActive: true,
        order: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "step_4",
        stepNumber: "04",
        title: "Identifying Realistic Goals",
        description:
          "Formulating collaborative, tangible milestones that prioritize your emotional peace and authentic wellbeing.",
        isActive: true,
        order: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "step_5",
        stepNumber: "05",
        title: "Working Together at Your Pace",
        description:
          "Continuing steady therapeutic accompaniment with regular review of what feels supportive and what needs adjustment.",
        isActive: true,
        order: 5,
        createdAt: now,
        updatedAt: now,
      },
    ],
    clientTypes: [
      {
        id: "ct_1",
        title: "Adolescents",
        description:
          "Supporting teens through emotional turbulence, self-identity questions, and social pressures.",
        isActive: true,
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "ct_2",
        title: "Young Adults",
        description:
          "Navigating early career transitions, independence from family, and relationship shifts.",
        isActive: true,
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "ct_3",
        title: "Adults",
        description:
          "Unpacking mid-life transitions, chronic worry, personal values, and boundary setting.",
        isActive: true,
        order: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "ct_4",
        title: "Students",
        description:
          "Addressing exam pressure, imposter feelings, academic burnout, and future dread.",
        isActive: true,
        order: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "ct_5",
        title: "Working Professionals",
        description:
          "Managing corporate stress, work-life balance erosion, and interpersonal conflicts.",
        isActive: true,
        order: 5,
        createdAt: now,
        updatedAt: now,
      },
    ],
    media: [
      {
        id: "med_1",
        filename: "aswathy-portrait.jpg",
        title: "Aswathy Jeyarajasekar Portrait",
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
        category: "profile",
        mimeType: "image/jpeg",
        sizeBytes: 145000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "med_2",
        filename: "sanctuary-room.jpg",
        title: "Quiet Consulting Sanctuary Studio",
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
        category: "website",
        mimeType: "image/jpeg",
        sizeBytes: 210000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "med_3",
        filename: "logo.png",
        title: "Aswathy Jeyarajasekar Sunflower Emblem",
        url: "/logo.png",
        category: "website",
        mimeType: "image/png",
        sizeBytes: 8400,
        createdAt: now,
        updatedAt: now,
      },
    ],
    notifications: [],
    settings: {
      general: {
        websiteName: "Aswathy Jeyarajasekar | Counselling Psychologist",
        practiceName: "The Safe Sanctuary | Aswathy Counselling",
        tagline: "Gentle, non-judgmental space for emotional healing",
        email: "roottherapyonline@gmail.com",
        contactEmail: "roottherapyonline@gmail.com",
        phone: "+91 755 000 2973",
        contactPhone: "+91 755 000 2973",
        clinicAddress: "Quiet Mind Sanctuary, Anna Nagar, Chennai, Tamil Nadu",
        instagram: "https://instagram.com/aswathy.psychology",
        linkedin: "https://linkedin.com/in/aswathy-jeyarajasekar",
        whatsapp: "https://wa.me/917550002973",
        currency: "INR (₹)",
        timezone: "Asia/Kolkata (IST)",
      },
      booking: {
        defaultSessionDuration: 50,
        bufferTime: 15,
        bufferTimeMinutes: 15,
        advanceNoticeHours: 24,
        maxAdvanceDays: 60,
        cancellationNoticeHours: 24,
        cancellationPolicyHours: 24,
        confirmationMessage:
          "Thank you for reaching out. Your confidential session has been reserved. A confirmation email with telehealth instructions has been dispatched.",
        defaultFormat: "online",
      },
      account: {
        adminName: "Aswathy Jeyarajasekar",
        email: "roottherapyonline@gmail.com",
        profileImage:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
      },
      notifications: {
        emailNotifications: true,
        bookingAlerts: true,
        enquiryAlerts: true,
        feedbackAlerts: true,
        emailOnBooking: true,
        emailOnEnquiry: true,
        dailySummaryDigest: false,
      },
    },
  };
}

// ==========================================
// DATABASE ENGINE WITH ATOMIC WRITES
// ==========================================



let memoryDb: DatabaseSchema | null = null;

export function resetMemoryDb(): void {
  memoryDb = null;
}

async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

export async function getDatabase(): Promise<DatabaseSchema> {
  // 1. Primary: Load fresh state from Supabase PostgreSQL
  try {
    const supabaseData = await loadDatabaseFromSupabase();
    if (supabaseData && supabaseData.admins && supabaseData.admins.length > 0) {
      if (!supabaseData.sessionFormats || supabaseData.sessionFormats.length === 0) {
        supabaseData.sessionFormats = DEFAULT_SESSION_FORMATS;
      }
      if (!supabaseData.bookingFormConfig) {
        supabaseData.bookingFormConfig = DEFAULT_BOOKING_FORM_CONFIG;
      } else {
        supabaseData.bookingFormConfig = {
          ...DEFAULT_BOOKING_FORM_CONFIG,
          ...supabaseData.bookingFormConfig,
        };
      }
      memoryDb = supabaseData;
      return memoryDb;
    }
  } catch (err) {
    console.error("Supabase load attempt failed, falling back to local file:", err);
  }

  if (memoryDb) {
    if (!memoryDb.sessionFormats || memoryDb.sessionFormats.length === 0) {
      memoryDb.sessionFormats = DEFAULT_SESSION_FORMATS;
    }
    if (!memoryDb.bookingFormConfig) {
      memoryDb.bookingFormConfig = DEFAULT_BOOKING_FORM_CONFIG;
    } else {
      memoryDb.bookingFormConfig = {
        ...DEFAULT_BOOKING_FORM_CONFIG,
        ...memoryDb.bookingFormConfig,
      };
    }
    return memoryDb;
  }

  // 2. Fallback: Load from local file or seed
  await ensureDataDirectory();

  try {
    const content = await fs.readFile(DB_FILE, "utf8");
    memoryDb = JSON.parse(content);
    if (!memoryDb!.sessionFormats || memoryDb!.sessionFormats.length === 0) {
      memoryDb!.sessionFormats = DEFAULT_SESSION_FORMATS;
    }
    if (!memoryDb!.bookingFormConfig) {
      memoryDb!.bookingFormConfig = DEFAULT_BOOKING_FORM_CONFIG;
    } else {
      memoryDb!.bookingFormConfig = {
        ...DEFAULT_BOOKING_FORM_CONFIG,
        ...memoryDb!.bookingFormConfig,
      };
    }
    return memoryDb as DatabaseSchema;
  } catch {
    // If file doesn't exist or is invalid, seed clean data
    const initialSeed = createInitialSeedData();
    initialSeed.sessionFormats = DEFAULT_SESSION_FORMATS;
    initialSeed.bookingFormConfig = DEFAULT_BOOKING_FORM_CONFIG;
    await saveDatabase(initialSeed);
    memoryDb = initialSeed;
    return memoryDb;
  }
}

export async function saveDatabase(data: DatabaseSchema): Promise<void> {
  memoryDb = data;

  // 1. Primary: Save to Supabase PostgreSQL
  try {
    await saveDatabaseToSupabase(data);
  } catch (err) {
    console.error("Error saving to Supabase PostgreSQL:", err);
  }

  // 2. Secondary: Keep local JSON backup in sync
  try {
    await ensureDataDirectory();
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    const serialized = JSON.stringify(data, null, 2);

    await fs.writeFile(tempFile, serialized, "utf8");
    await fs.rename(tempFile, DB_FILE);
  } catch (err) {
    console.error("Error updating local backup:", err);
  }
}

/**
 * Specifically persists the bookingFormConfig collection quickly and reliably
 */
export async function saveBookingFormConfig(
  config: Partial<import("./booking-config").BookingFormConfig>
): Promise<import("./booking-config").BookingFormConfig> {
  const db = await getDatabase();
  db.bookingFormConfig = {
    ...(db.bookingFormConfig || DEFAULT_BOOKING_FORM_CONFIG),
    ...config,
    updatedAt: new Date().toISOString(),
  };
  memoryDb = db;

  // 1. Primary: Direct single-collection upsert to Supabase
  try {
    const { saveCollectionToSupabase } = await import("./supabase-db");
    await saveCollectionToSupabase("bookingFormConfig", db.bookingFormConfig);
  } catch (err) {
    console.error("Failed to direct-save bookingFormConfig to Supabase, falling back to full save:", err);
    await saveDatabase(db);
  }

  // 2. Local file backup
  try {
    await ensureDataDirectory();
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    const serialized = JSON.stringify(db, null, 2);
    await fs.writeFile(tempFile, serialized, "utf8");
    await fs.rename(tempFile, DB_FILE);
  } catch {
    // Non-fatal
  }

  return db.bookingFormConfig;
}


/**
 * Returns privacy-safe booked slot timestamps ({ date, time }) for active bookings.
 * Merges memory/JSONB data and relational PostgreSQL data.
 */
export async function getBookedSlots(
  dateFilter?: string
): Promise<Array<{ date: string; time: string }>> {
  const db = await getDatabase();
  const bookedMap = new Map<string, { date: string; time: string }>();

  // 1. From active bookings in JSONB / memory database
  for (const b of db.bookings || []) {
    if (!b.deletedAt && b.bookingStatus !== "cancelled") {
      const bDate = (b.appointmentDate || (b as any).date || "").split("T")[0];
      const bTime = (b.appointmentTime || (b as any).time || "").trim();
      if (bDate && bTime && (!dateFilter || bDate === dateFilter)) {
        const key = `${bDate}__${bTime.toLowerCase()}`;
        bookedMap.set(key, { date: bDate, time: bTime });
      }
    }
  }

  // 2. From relational bookings table in PostgreSQL if reachable
  try {
    const pool = getPgPool();
    const query = dateFilter
      ? `SELECT appointment_date, appointment_time FROM bookings WHERE deleted_at IS NULL AND status != 'cancelled' AND (appointment_date = $1 OR appointment_date::text LIKE $2)`
      : `SELECT appointment_date, appointment_time FROM bookings WHERE deleted_at IS NULL AND status != 'cancelled'`;
    const params = dateFilter ? [dateFilter, `${dateFilter}%`] : [];
    const res = await pool.query(query, params);
    for (const row of res.rows) {
      const bDate = row.appointment_date
        ? new Date(row.appointment_date).toISOString().split("T")[0]
        : "";
      const bTime = (row.appointment_time || "").trim();
      if (bDate && bTime && (!dateFilter || bDate === dateFilter)) {
        const key = `${bDate}__${bTime.toLowerCase()}`;
        if (!bookedMap.has(key)) {
          bookedMap.set(key, { date: bDate, time: bTime });
        }
      }
    }
  } catch {
    // Non-fatal fallback to memory data
  }

  return Array.from(bookedMap.values());
}
