"use client";

import { useState, useEffect } from "react";

interface TestimonialItem {
  id?: string;
  quote: string;
  client: string;
  context: string;
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

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(defaultTestimonials);

  useEffect(() => {
    let isMounted = true;
    async function loadTestimonials() {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          const mapped: TestimonialItem[] = data.testimonials.map((t: any) => ({
            id: t.id,
            quote: t.feedback,
            client: t.isAnonymous ? (t.clientDisplayName || "Client") : t.clientDisplayName,
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
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {testimonials.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-space-xl rounded-3xl bg-surface shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between space-y-space-lg border border-parchment-border/40"
            >
              <div className="space-y-space-sm">
                <span className="font-headline-xl text-headline-xl text-secondary-fixed-dim leading-none font-serif block select-none">
                  “
                </span>
                <p className="font-quote-editorial text-quote-editorial italic text-primary leading-relaxed text-lg">
                  {item.quote}
                </p>
              </div>
              <div className="pt-space-xs border-t border-surface-container">
                <span className="font-body-sm text-body-sm font-semibold text-primary block">
                  {item.client}
                </span>
                <span className="font-label-caps text-label-caps text-on-surface-variant text-[11px]">
                  {item.context}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
