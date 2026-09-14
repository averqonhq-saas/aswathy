"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface RawTestimonial {
  id?: string;
  feedback: string;
  isAnonymous?: boolean;
  clientDisplayName?: string;
  serviceName?: string;
}

interface TestimonialItem {
  id?: string;
  quote: string;
  client: string;
  context: string;
}

const CHAR_LIMIT = 210;

function truncateQuote(text: string, limit: number = CHAR_LIMIT): string {
  if (!text) return "";
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= limit) return singleLine;
  const sliced = singleLine.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trim() + "…";
}

const defaultTestimonials: TestimonialItem[] = [
  {
    quote:
      "For the first time in years, I felt like someone wasn't rushing me to fix everything immediately. Aswathy created a calm space where I finally stopped holding my breath.",
    client: "Young Professional",
    context: "Anxiety & Career Transitions",
  },
  {
    quote:
      "Her thoughtful questions gently helped me recognize patterns I had repeated for a decade. Our sessions always feel like an honest, comforting conversation.",
    client: "Graduate Student",
    context: "Academic Pressure & Self-Esteem",
  },
  {
    quote:
      "Aswathy gave me the vocabulary to understand my boundaries without drowning in guilt. It has transformed how I interact with my family and partner.",
    client: "Adult Client",
    context: "Relationship & Family Boundaries",
  },
];

export interface TestimonialsSectionProps {
  initialTestimonials?: TestimonialItem[];
}

export default function TestimonialsSection({ initialTestimonials }: TestimonialsSectionProps = {}) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials || defaultTestimonials);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    if (initialTestimonials && initialTestimonials.length > 0) return;

    let isMounted = true;
    async function loadTestimonials() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          const mapped: TestimonialItem[] = data.testimonials.map((t: RawTestimonial) => ({
            id: t.id,
            quote: t.feedback,
            client: t.isAnonymous ? (t.clientDisplayName || "Client") : (t.clientDisplayName || "Client"),
            context: t.serviceName || "Individual Counselling",
          }));
          setTestimonials(mapped);
        }
      } catch (err) {
        console.error("Error loading testimonials:", err);
      }
    }
    loadTestimonials();
    return () => {
      isMounted = false;
    };
  }, [initialTestimonials]);

  return (
    <section className="py-space-3xl lg:py-space-4xl bg-surface-container-low px-gutter-mobile lg:px-gutter-desktop">
      <div className="max-w-container-max mx-auto space-y-space-2xl">
        <div className="text-center max-w-xl mx-auto space-y-space-xs">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
            Reflections &amp; Experiences
          </span>
          <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
            Words from clients.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Honest thoughts on finding safety and clarity through person-centered
            counselling.
          </p>
        </div>

        {/* Testimonial Cards Mosaic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg items-stretch">
          {testimonials.map((item, idx) => {
            const cardKey = item.id || `testimonial_${idx}`;
            const cleanQuote = (item.quote || "").replace(/\r\n/g, "\n").trim();
            const isLong = Boolean(cleanQuote && cleanQuote.length > CHAR_LIMIT);
            const isExpanded = Boolean(expandedMap[cardKey]);
            const displayText = isLong && !isExpanded ? truncateQuote(cleanQuote) : cleanQuote;

            return (
              <div
                key={cardKey}
                className="p-space-xl rounded-3xl bg-surface shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-full border border-parchment-border/40"
              >
                {/* Content Block */}
                <div className="flex-1 flex flex-col items-start">
                  <span className="font-headline-xl text-headline-xl text-secondary-fixed-dim leading-none font-serif block select-none mb-space-xs">
                    “
                  </span>
                  <p
                    className={`font-quote-editorial text-quote-editorial italic text-primary leading-relaxed text-base lg:text-lg ${
                      isExpanded ? "whitespace-pre-line" : ""
                    }`}
                  >
                    {displayText}
                  </p>

                  {isLong && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(cardKey)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors cursor-pointer group mt-3 self-start"
                      aria-expanded={isExpanded}
                    >
                      <span className="underline underline-offset-4 decoration-secondary-fixed-dim/70 group-hover:decoration-primary">
                        {isExpanded ? "Read less" : "Read more"}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 text-secondary group-hover:text-primary ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Card footer pinned to bottom */}
                <div className="pt-space-md border-t border-surface-container mt-space-lg w-full">
                  <span className="font-body-sm text-body-sm font-semibold text-primary block">
                    {item.client}
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[11px] block mt-0.5">
                    {item.context}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
