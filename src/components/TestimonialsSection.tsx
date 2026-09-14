"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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

const CHAR_LIMIT = 160;

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

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

  // Handle active slide tracking on manual scroll
  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft } = carouselRef.current;
    const firstChild = carouselRef.current.firstElementChild as HTMLElement;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth + 24; // 24px gap (gap-space-lg)
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), testimonials.length - 1));
  }, [testimonials.length]);

  const scrollToIdx = useCallback((idx: number) => {
    if (!carouselRef.current) return;
    const firstChild = carouselRef.current.firstElementChild as HTMLElement;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth + 24;
    carouselRef.current.scrollTo({
      left: idx * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(idx);
  }, []);

  const scrollPrev = () => {
    const nextIdx = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
    scrollToIdx(nextIdx);
  };

  const scrollNext = () => {
    const nextIdx = (activeIndex + 1) % testimonials.length;
    scrollToIdx(nextIdx);
  };

  // Auto-roll left to right (advancing sequentially every 4.5s)
  useEffect(() => {
    if (isHovered || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % testimonials.length;
        if (carouselRef.current) {
          const firstChild = carouselRef.current.firstElementChild as HTMLElement;
          if (firstChild) {
            const cardWidth = firstChild.offsetWidth + 24;
            carouselRef.current.scrollTo({
              left: next * cardWidth,
              behavior: "smooth",
            });
          }
        }
        return next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isHovered, testimonials.length]);

  return (
    <section className="py-space-3xl lg:py-space-4xl bg-surface-container-low px-gutter-mobile lg:px-gutter-desktop overflow-hidden">
      <div className="max-w-container-max mx-auto space-y-space-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="space-y-space-xs max-w-xl">
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

          {/* Carousel Arrow Controls */}
          {testimonials.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Container */}
        <div
          className="relative w-full group/carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {/* Testimonial Cards Carousel Track */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex gap-space-lg overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 no-scrollbar -mx-gutter-mobile lg:-mx-gutter-desktop px-gutter-mobile lg:px-gutter-desktop items-stretch"
          >
            {testimonials.map((item, idx) => {
              const cardKey = item.id || `testimonial_${idx}`;
              const cleanQuote = (item.quote || "").replace(/\r\n/g, "\n").trim();
              const isLong = Boolean(cleanQuote && cleanQuote.length > CHAR_LIMIT);
              const isExpanded = Boolean(expandedMap[cardKey]);
              const displayText = isLong && !isExpanded ? truncateQuote(cleanQuote) : cleanQuote;

              return (
                <div
                  key={cardKey}
                  className="w-[75vw] sm:w-[300px] md:w-[330px] shrink-0 snap-start p-space-md sm:p-space-lg rounded-2xl bg-surface shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between border border-parchment-border/50 min-h-[220px]"
                >
                  {/* Content Block */}
                  <div className="flex-1 flex flex-col items-start">
                    <span className="font-headline-xl text-2xl text-secondary-fixed-dim leading-none font-serif block select-none mb-1">
                      “
                    </span>
                    <p
                      className={`font-headline-xl !text-[15px] sm:!text-base italic text-primary !leading-relaxed ${
                        isExpanded ? "whitespace-pre-line" : ""
                      }`}
                    >
                      {displayText}
                    </p>

                    {isLong && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(cardKey)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors cursor-pointer group mt-2.5 self-start"
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
                  <div className="pt-space-xs border-t border-surface-container mt-space-md w-full">
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

          {/* Pagination Dots */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-space-lg">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIdx(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? "w-8 bg-secondary"
                      : "w-2 bg-secondary-fixed-dim/40 hover:bg-secondary/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

