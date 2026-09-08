"use client";

import { useState, useEffect } from "react";

interface StepItem {
  num: string | number;
  title: string;
  desc: string;
}

const defaultSteps: StepItem[] = [
  {
    num: "01",
    title: "Initial Conversation",
    desc: "A gentle introduction to meet each other, establish comfort, and understand your needs.",
  },
  {
    num: "02",
    title: "Understanding Concerns",
    desc: "Unpacking the life experiences and emotional weights that brought you to seeking support.",
  },
  {
    num: "03",
    title: "Exploring Patterns",
    desc: "Identifying relational dynamics, coping tendencies, and underlying emotional habits.",
  },
  {
    num: "04",
    title: "Identifying Goals",
    desc: "Co-creating meaningful milestones that resonate with your personal values and identity.",
  },
  {
    num: "05",
    title: "Working at Your Pace",
    desc: "Continuous, supportive exploration with flexible cadence matching your everyday life.",
  },
];

export default function SessionJourneySection() {
  const [steps, setSteps] = useState<StepItem[]>(defaultSteps);

  useEffect(() => {
    let isMounted = true;
    async function loadSteps() {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
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
  }, []);

  return (
    <section
      id="expectations"
      className="py-space-3xl lg:py-space-4xl px-gutter-mobile lg:px-gutter-desktop overflow-hidden scroll-mt-20"
    >
      <div className="max-w-container-max mx-auto space-y-space-2xl">
        <div className="max-w-2xl space-y-space-xs">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
            What to Expect
          </span>
          <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
            Nothing has to be figured out{" "}
            <span className="italic">before you arrive.</span>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            A transparent, welcoming sequence designed to alleviate uncertainty
            before, during, and between our sessions.
          </p>
        </div>

        {/* Flowing Organic Timeline with Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(steps.length, 5)} gap-space-md pt-space-md relative`}>
          {/* Connecting subtle line visible on md screens */}
          <div className="hidden md:block absolute top-12 left-8 right-8 h-0.5 bg-surface-container-highest -z-10"></div>

          {steps.map((step) => (
            <div
              key={step.num}
              className="p-space-lg rounded-2xl bg-surface-container flex flex-col justify-between space-y-space-md shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center font-headline-sm text-headline-sm text-primary shadow-sm">
                {step.num}
              </div>
              <div className="space-y-space-xxs">
                <h3 className="font-headline-sm text-headline-sm text-primary text-base">
                  {step.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
