"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { JourneyEntry } from "@/lib/types";

const defaultJourneyEntries: JourneyEntry[] = [
  {
    id: "jrn_1",
    year: "The Catalyst",
    heading: "11th Grade & Personal Therapy Experience",
    description:
      "Realizing how healing it is to have an unbiased, safe listener.",
    order: 1,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "jrn_2",
    year: "Education",
    heading: "B.Sc. & M.Sc. in Counselling Psychology",
    description:
      "In-depth training in clinical foundations, therapeutic ethics, and human development.",
    order: 2,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "jrn_3",
    year: "Today",
    heading: "Dedicated Private Practice",
    description:
      "Offering thoughtful counselling sessions for adolescents, young adults, and adults worldwide.",
    order: 3,
    createdAt: "",
    updatedAt: "",
  },
];

export interface MyJourneySectionProps {
  initialJourney?: JourneyEntry[];
}

export default function MyJourneySection({ initialJourney }: MyJourneySectionProps = {}) {
  const [entries, setEntries] = useState<JourneyEntry[]>(initialJourney || defaultJourneyEntries);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check initial hash
    if (typeof window !== "undefined" && window.location.hash === "#journey") {
      setIsOpen(true);
    }

    const handleHash = () => {
      if (window.location.hash === "#journey") {
        setIsOpen(true);
      }
    };

    const handleState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      if (customEvent.detail !== undefined) {
        setIsOpen(customEvent.detail.isOpen);
      }
    };

    window.addEventListener("hashchange", handleHash);
    window.addEventListener("journey-state-change", handleState);

    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("journey-state-change", handleState);
    };
  }, []);

  useEffect(() => {
    if (initialJourney && initialJourney.length > 0) return;

    let isMounted = true;
    async function loadJourney() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) return;
        const data = await res.json();
        if (
          isMounted &&
          data.journey &&
          Array.isArray(data.journey) &&
          data.journey.length > 0
        ) {
          setEntries(data.journey);
        }
      } catch (err) {
        console.error("Failed to load journey entries:", err);
      }
    }
    loadJourney();
    return () => {
      isMounted = false;
    };
  }, [initialJourney]);

  return (
    <div
      className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen
          ? "grid-rows-[1fr] opacity-100 mb-0"
          : "grid-rows-[0fr] opacity-0 pointer-events-none mb-0"
      }`}
    >
      <div className="overflow-hidden">
        <section
          id="journey"
          className="py-space-2xl lg:py-space-3xl bg-surface-container-low px-gutter-mobile lg:px-gutter-desktop scroll-mt-20 border-t border-parchment-border/40"
        >
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl lg:gap-space-2xl items-center">
            <div className="lg:col-span-5 space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block text-[11px]">
                    Origin &amp; Inspiration
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(
                      new CustomEvent("journey-state-change", { detail: { isOpen: false } })
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface hover:bg-surface-container text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-all duration-200 cursor-pointer border border-parchment-border shadow-2xs hover:scale-105 active:scale-95"
                  aria-label="Hide section"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Hide</span>
                </button>
              </div>
              <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
                How I found my way to <span className="italic">psychology.</span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Her journey began in 11th grade, when she experienced the impact of
                receiving professional psychological support during a difficult
                phase of her life. That experience sparked her interest in
                psychology and eventually shaped her academic and professional
                journey.
              </p>
            </div>

            <div className="lg:col-span-7 flex flex-col space-y-space-md">
              {/* Visual Timeline */}
              <div className="p-space-lg sm:p-space-xl rounded-3xl bg-surface shadow-xs space-y-space-lg border border-parchment-border/40">
                {entries.map((entry, index) => {
                  const isFirst = index === 0;
                  const isLast = index === entries.length - 1;

                  return (
                    <div key={entry.id || index} className="space-y-space-md group/entry">
                      <div className="flex items-start sm:items-center gap-space-md p-space-sm sm:p-space-md rounded-2xl hover:bg-surface-container-low/70 transition-all duration-300">
                        {isFirst ? (
                          <div className="w-11 h-11 rounded-full bg-secondary-fixed/40 flex items-center justify-center text-primary font-headline-sm shrink-0 shadow-2xs group-hover/entry:scale-110 transition-transform duration-300">
                            ★
                          </div>
                        ) : isLast ? (
                          <div className="w-11 h-11 rounded-full bg-primary-container text-surface flex items-center justify-center font-headline-sm shadow-xs shrink-0 group-hover/entry:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[19px] text-surface">
                              spa
                            </span>
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-primary font-headline-sm shrink-0 group-hover/entry:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[19px] text-warm-umber">
                              menu_book
                            </span>
                          </div>
                        )}

                        <div className="space-y-0.5">
                          <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary text-[11px] font-semibold">
                            {entry.year}
                          </span>
                          <h3 className="font-headline-sm text-headline-sm text-primary group-hover/entry:text-primary-container transition-colors">
                            {entry.heading}
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            {entry.description}
                          </p>
                        </div>
                      </div>

                      {!isLast && (
                        <div className="pl-6 ml-5 h-5 border-l-2 border-dashed border-secondary-fixed/70"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
