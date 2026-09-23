"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Compass,
  Layers,
  Target,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  HeartHandshake,
} from "lucide-react";

export interface StepItem {
  num: string | number;
  title: string;
  desc: string;
}

const defaultSteps: StepItem[] = [
  {
    num: "01",
    title: "Connecting & Understanding",
    desc: "The first phase is about creating a safe, comfortable space and understanding what brings you to therapy. We explore your concerns, experiences, emotions, relationships, and what you hope to work towards.",
  },
  {
    num: "02",
    title: "Exploring & Becoming Aware",
    desc: "Together, we gently explore patterns, emotions, beliefs, relationships, and coping responses. This phase is about developing a deeper understanding of yourself and what may be influencing your present experiences.",
  },
  {
    num: "03",
    title: "Working Through & Building Skills",
    desc: "As we understand your experiences better, therapy focuses on working through what feels difficult and developing healthier ways of coping, emotional regulation, self-awareness, communication, and decision-making.",
  },
  {
    num: "04",
    title: "Growth & Integration",
    desc: "The focus gradually shifts towards applying what you have explored in therapy to everyday life. You may begin to notice changes in how you respond to yourself, others, and challenging situations.",
  },
  {
    num: "05",
    title: "Reviewing & Moving Forward",
    desc: "We reflect on your progress, the changes you have made, and the areas you may still want to work on. Depending on your needs, therapy may gradually reduce in frequency, come to an end, or continue with new goals.",
  },
];

const STEP_ICONS = [
  MessageCircle,
  Compass,
  Layers,
  Target,
  CheckCircle2,
  Sparkles,
];

export interface SessionJourneySectionProps {
  initialSteps?: StepItem[];
  onOpenBooking?: () => void;
}

export default function SessionJourneySection({
  initialSteps,
  onOpenBooking,
}: SessionJourneySectionProps = {}) {
  const [steps, setSteps] = useState<StepItem[]>(initialSteps || defaultSteps);

  useEffect(() => {
    if (initialSteps && initialSteps.length > 0) return;

    let isMounted = true;
    async function loadSteps() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) return;
        const data = await res.json();
        if (
          isMounted &&
          data.sessionSteps &&
          Array.isArray(data.sessionSteps) &&
          data.sessionSteps.length > 0
        ) {
          const activeSteps: StepItem[] = data.sessionSteps
            .filter((s: any) => s.isActive !== false)
            .map((s: any, idx: number) => ({
              num: s.stepNumber || String(idx + 1).padStart(2, "0"),
              title: s.title,
              desc: s.description,
            }));
          if (activeSteps.length > 0) {
            setSteps(activeSteps);
          }
        }
      } catch (err) {
        console.error("Failed to load session steps:", err);
      }
    }
    loadSteps();
    return () => {
      isMounted = false;
    };
  }, [initialSteps]);

  const handleBookingClick = () => {
    if (onOpenBooking) {
      onOpenBooking();
    } else {
      const el = document.getElementById("booking");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      id="expectations"
      className="py-16 sm:py-20 lg:py-24 px-5 sm:px-8 lg:px-12 overflow-hidden scroll-mt-20 bg-surface"
    >
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-14">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A3828]/5 border border-[#1A3828]/15 text-[#1A3828] text-xs font-semibold tracking-wider uppercase font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#705d00]" />
              <span>Counselling Process</span>
            </div>

            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A3828] tracking-tight leading-tight">
              What to expect in a session.
              <span className="italic block text-xl sm:text-2xl text-[#1A3828]/80 mt-1.5 font-normal">
                Nothing has to be figured out before you arrive.
              </span>
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#5A4033] leading-relaxed">
              A transparent, welcoming sequence designed to alleviate uncertainty
              before, during, and between our sessions.
            </p>
          </div>

          {/* Quick Pillars */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1A3828]/10 text-xs font-medium text-[#1A3828] shadow-2xs font-sans">
              <Lock className="w-3.5 h-3.5 text-[#705d00]" />
              <span>100% Confidential</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1A3828]/10 text-xs font-medium text-[#1A3828] shadow-2xs font-sans">
              <HeartHandshake className="w-3.5 h-3.5 text-[#705d00]" />
              <span>Safe &amp; Non-Judgmental</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1A3828]/10 text-xs font-medium text-[#1A3828] shadow-2xs font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#705d00]" />
              <span>At Your Natural Pace</span>
            </div>
          </div>
        </div>

        {/* Modern Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {steps.map((step, idx) => {
            const IconComponent = STEP_ICONS[idx % STEP_ICONS.length] || Sparkles;
            const stepNumberDisplay =
              typeof step.num === "number"
                ? String(step.num).padStart(2, "0")
                : String(step.num);

            return (
              <div
                key={step.num || idx}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-[#1A3828]/10 hover:border-[#1A3828]/30 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
              >
                {/* Subtle top amber highlight on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F4D242] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top Bar: Step Pill Badge & Thematic Icon */}
                  <div className="flex items-center justify-between gap-3 pb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3828]/5 group-hover:bg-[#1A3828] text-[#1A3828] group-hover:text-[#F4D242] font-semibold text-xs tracking-wider transition-colors duration-300 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F4D242]" />
                      Step {stepNumberDisplay}
                    </span>

                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#1A3828]/10 flex items-center justify-center text-[#1A3828] group-hover:bg-[#1A3828] group-hover:text-[#F4D242] transition-all duration-300 shadow-2xs">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Step Title & Description */}
                  <div className="space-y-2 pt-1">
                    <h3 className="font-playfair text-xl font-bold text-[#1A3828] tracking-tight group-hover:text-[#1A3828] transition-colors leading-snug">
                      {step.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#5A4033]/90 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Progress Indicator */}
                <div className="mt-6 pt-4 border-t border-[#1A3828]/10 flex items-center justify-between text-xs text-[#705d00] font-medium font-sans">
                  <span>Phase {idx + 1} of {steps.length}</span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                    <span className="text-[11px] font-normal text-[#7B7368]">Milestone</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#705d00]" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Balanced Action Card when there are 5 steps */}
          {steps.length === 5 && (
            <div className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1A3828] via-[#142C1F] to-[#0E1E15] text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-[#1A3828]">
              <div>
                <div className="flex items-center justify-between gap-3 pb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F4D242] font-semibold text-xs tracking-wider uppercase font-sans border border-white/15">
                    <Sparkles className="w-3 h-3 text-[#F4D242]" />
                    Your Safe Space
                  </span>

                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#F4D242] shadow-2xs">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <h3 className="font-playfair text-xl font-bold text-white tracking-tight leading-snug">
                    Ready to Begin Your Healing Journey?
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed">
                    Taking the first step takes courage. Whether you need clarity, emotional relief, or relationship support, we begin together in safety.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  href="/book-a-session"
                  onClick={handleBookingClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4D242] text-[#1A3828] font-bold text-xs hover:bg-[#ffe16d] transition-all duration-200 shadow-sm font-sans cursor-pointer"
                >
                  <span>Book Initial Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Assurance Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] border border-[#1A3828]/10 text-xs text-[#5A4033]">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1A3828]/10 text-[#1A3828] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <ShieldCheck className="w-5 h-5 text-[#1A3828]" />
            </div>
            <p className="leading-relaxed font-sans">
              <strong className="text-[#1A3828]">Confidential &amp; Personalized:</strong> Every session is tailored entirely to your personal boundaries and pace. You are in control of what you choose to share.
            </p>
          </div>

          <Link
            href="/book-a-session"
            onClick={handleBookingClick}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A3828] text-[#F4D242] text-xs font-semibold hover:bg-[#142C1F] transition-colors shadow-2xs font-sans cursor-pointer"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
