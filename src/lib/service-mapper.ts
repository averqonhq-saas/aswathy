import type { ServiceDetail } from "@/components/ServiceModal";

export interface DbService {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  durationMinutes: number;
  price: number;
  image?: string;
  status: "active" | "disabled";
  order: number;
}

export const defaultDetailsMap: Record<string, Partial<ServiceDetail>> = {
  emotional: {
    badge: "Gentle Self-Regulation",
    icon: "favorite",
    focusAreas: [
      "Generalized anxiety & racing thoughts",
      "Low mood and emotional numbness",
      "Nervous system overwhelm & burnout",
      "Emotional swings & regulation strategies",
      "Somatic grounding & body awareness",
      "Cultivating self-compassion",
    ],
    takeaways: [
      "Understand your emotional triggers and physical signals",
      "Develop gentle grounding tools that work in real-time",
      "Shift from harsh self-criticism to curious self-acceptance",
    ],
  },
  personal: {
    badge: "Inner Clarity & Grounding",
    icon: "psychology",
    focusAreas: [
      "Persistent imposter syndrome at work or study",
      "Paralyzing fear of failure or mistakes",
      "Unresolved grief, loss, and life heartbreaks",
      "Decision fatigue and existential doubt",
      "Rebuilding genuine self-worth and confidence",
      "Navigating changes in personal values",
    ],
    takeaways: [
      "Separate your self-worth from productivity or perfection",
      "Process complex emotions of grief and change safely",
      "Establish internal validation and steady decision confidence",
    ],
  },
  relation: {
    badge: "Safe Boundaries",
    icon: "diversity_1",
    focusAreas: [
      "Saying 'no' without crippling guilt or fear of rejection",
      "Understanding anxious or avoidant attachment cycles",
      "Navigating high-friction family dynamics",
      "Overcoming social anxiety and self-consciousness",
      "Communicating needs clearly and constructively",
      "Recovering from interpersonal betrayals or breakups",
    ],
    takeaways: [
      "Clear, kind boundaries that honor yourself and others",
      "Clarity on emotional triggers in relationships",
      "Confidence in expressing authentic needs without defensive walls",
    ],
  },
  student: {
    badge: "Empowering Transitions",
    icon: "local_library",
    focusAreas: [
      "Overcoming academic paralysis and chronic procrastination",
      "Coping with intense competition and peer comparison",
      "Transitioning out of home / campus life",
      "First-job adjustments and workplace culture shock",
      "Parental expectations vs. authentic personal goals",
      "Managing finances and adult independence stress",
    ],
    takeaways: [
      "Realistic routines that prevent cyclical burnout",
      "Clarity on personal priorities beyond external validation",
      "Grounding practices for high-stakes presentations and exams",
    ],
  },
  life: {
    badge: "Navigating The Unknown",
    icon: "alt_route",
    focusAreas: [
      "Relocating to a new city, country, or cultural context",
      "Sudden career pivots or unexpected job loss",
      "Quarter-life or mid-career existential re-evaluations",
      "Adapting to health shifts or unexpected family roles",
      "Rebuilding routine and belonging from ground zero",
      "Embracing ambiguity and gradual rebuilding",
    ],
    takeaways: [
      "A compassionate anchor during times of uncertainty",
      "Resilience strategies tailored to your nervous system",
      "A step-by-step framework to navigate the unfamiliar at your pace",
    ],
  },
};

export function getMetadataForService(svc: DbService): Partial<ServiceDetail> {
  const key = `${svc.id} ${svc.categoryId} ${svc.name}`.toLowerCase();
  if (key.includes("emotional") || key.includes("stress")) return defaultDetailsMap.emotional;
  if (key.includes("personal") || key.includes("compassion")) return defaultDetailsMap.personal;
  if (key.includes("relation") || key.includes("interpersonal")) return defaultDetailsMap.relation;
  if (key.includes("student") || key.includes("young") || key.includes("academic")) return defaultDetailsMap.student;
  if (key.includes("life") || key.includes("transition") || key.includes("challenge")) return defaultDetailsMap.life;

  return {
    badge: svc.categoryName || "Counselling",
    icon: "psychology",
    focusAreas: [
      "Personalized exploration and active listening",
      "Cognitive and emotional regulation strategies",
      "Evidence-informed psychological frameworks",
      "Safe, confidential person-centered support",
    ],
    takeaways: [
      "Practical tools tailored to your personal goals",
      "Greater self-awareness and emotional resilience",
      "A safe holding space for reflection",
    ],
  };
}

export function mapDbServiceToDetail(svc: DbService): ServiceDetail {
  const meta = getMetadataForService(svc);
  return {
    id: svc.id,
    title: svc.name,
    badge: meta.badge || svc.categoryName || "Counselling",
    icon: meta.icon || "psychology",
    summary: svc.shortDescription,
    description: svc.fullDescription,
    focusAreas: meta.focusAreas || [],
    takeaways: meta.takeaways || [],
    duration: `${svc.durationMinutes || 50} Minutes / Session`,
    format: "Online (Google Meet Telehealth)",
    price: svc.price,
  };
}
