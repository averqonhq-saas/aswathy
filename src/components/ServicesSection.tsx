"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ServiceModal, { ServiceDetail } from "./ServiceModal";

interface ServicesSectionProps {
  onOpenBooking?: (serviceTitle?: string) => void;
}

interface DbService {
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

// Fallback rich details when not provided in raw DB service
const defaultDetailsMap: Record<string, Partial<ServiceDetail>> = {
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

function getMetadataForService(svc: DbService): Partial<ServiceDetail> {
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

export default function ServicesSection({
  onOpenBooking,
}: ServicesSectionProps) {
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  // Load live active services from Supabase via public API
  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load services");
        const data = await res.json();
        
        if (isMounted && data.services && Array.isArray(data.services)) {
          const mapped = data.services.map((svc: DbService) => mapDbServiceToDetail(svc));
          setServices(mapped);
        }
      } catch (err) {
        console.error("Error loading services for public landing page:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="services"
      className="py-space-3xl lg:py-space-4xl px-gutter-mobile lg:px-gutter-desktop scroll-mt-20"
    >
      <div className="max-w-container-max mx-auto space-y-space-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="space-y-space-xs max-w-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
              Areas of Specialization
            </span>
            <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
              Ways we can <span className="italic">work together.</span>
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Support crafted around your specific relational, academic,
              emotional, or transitional circumstances.
            </p>
          </div>
          <Link
            href="/book-a-session#booking-form"
            className="inline-flex items-center gap-space-xs font-label-md text-label-md font-semibold text-primary uppercase tracking-wider group"
          >
            <span className="underline underline-offset-8 decoration-secondary-fixed-dim decoration-2 group-hover:decoration-primary">
              Book a Consultation
            </span>
            <span className="text-secondary transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-space-xl rounded-3xl bg-surface-container/60 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="p-space-xl rounded-3xl bg-surface-container text-center py-16">
            <p className="text-on-surface-variant text-sm">
              Services are currently being updated by the practice. Please check back soon or book a general consultation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {services.map((svc, idx) => {
              const isLast = idx === services.length - 1 && services.length % 3 === 2;
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`p-space-xl rounded-3xl bg-surface-container flex flex-col justify-between space-y-space-lg hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-transparent hover:border-parchment-border group ${
                    isLast ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface transition-colors">
                        <span className="material-symbols-outlined text-[18px]">
                          {svc.icon}
                        </span>
                      </span>
                      <span className="font-label-caps text-label-caps text-secondary uppercase text-[11px] group-hover:text-primary transition-colors">
                        Learn More →
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-primary-container transition-colors">
                      {svc.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      {svc.summary}
                    </p>
                  </div>
                  <div className="pt-space-xs border-t border-surface-container-high flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-secondary uppercase text-[11px]">
                      {svc.badge}
                    </span>
                    <span className="text-[12px] text-on-surface-variant font-body-sm font-medium">
                      {svc.duration} {svc.price ? `• ₹${svc.price}` : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onBook={(title) => {
          onOpenBooking?.(title);
        }}
      />
    </section>
  );
}
