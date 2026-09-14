"use client";

import { useState, useEffect } from "react";
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
    <section
      id="journey"
      className="py-space-3xl lg:py-space-4xl bg-surface-container-low px-gutter-mobile lg:px-gutter-desktop scroll-mt-20"
    >
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
        <div className="lg:col-span-5 space-y-space-md">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
            Origin &amp; Inspiration
          </span>
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
          <div className="p-space-xl rounded-3xl bg-surface shadow-sm space-y-space-lg">
            {entries.map((entry, index) => {
              const isFirst = index === 0;
              const isLast = index === entries.length - 1;

              return (
                <div key={entry.id || index} className="space-y-space-lg">
                  <div className="flex items-center gap-space-md">
                    {isFirst ? (
                      <div className="w-12 h-12 rounded-full bg-secondary-fixed/40 flex items-center justify-center text-primary font-headline-sm shrink-0">
                        ★
                      </div>
                    ) : isLast ? (
                      <div className="w-12 h-12 rounded-full bg-primary-container text-surface flex items-center justify-center font-headline-sm shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-[20px] text-surface">
                          spa
                        </span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary font-headline-sm shrink-0">
                        <span className="material-symbols-outlined text-[20px] text-warm-umber">
                          menu_book
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                        {entry.year}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-primary">
                        {entry.heading}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {entry.description}
                      </p>
                    </div>
                  </div>

                  {!isLast && (
                    <div className="pl-6 ml-6 h-6 border-l-2 border-dashed border-secondary-fixed"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
