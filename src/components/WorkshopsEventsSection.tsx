"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  Layers,
  Award,
} from "lucide-react";
import GalleryCard from "./gallery/GalleryCard";
import GalleryModal from "./gallery/GalleryModal";
import type { GalleryEvent } from "@/lib/types";

interface WorkshopsEventsSectionProps {
  initialEvents?: GalleryEvent[];
}

export default function WorkshopsEventsSection({
  initialEvents,
}: WorkshopsEventsSectionProps) {
  const [events, setEvents] = useState<GalleryEvent[]>(initialEvents || []);
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const carouselRef = useRef<HTMLDivElement>(null);

  // Client hydration fallback if initialEvents wasn't provided or updated
  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents);
      return;
    }

    let isMounted = true;
    async function loadGalleryEvents() {
      try {
        const res = await fetch("/api/gallery");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      } catch (err) {
        console.warn("Could not fetch gallery events for carousel:", err);
      }
    }
    loadGalleryEvents();
    return () => {
      isMounted = false;
    };
  }, [initialEvents]);

  // Update scroll boundaries & active index
  const updateScrollState = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const firstChild = carouselRef.current.firstElementChild as HTMLElement;
    if (firstChild) {
      const cardWidth = firstChild.offsetWidth + 24; // 24px gap
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(0, index), Math.max(0, events.length - 1)));
    }
  }, [events.length]);

  useEffect(() => {
    updateScrollState();
  }, [events, updateScrollState]);

  // Scroll to index
  const scrollToIndex = useCallback(
    (idx: number) => {
      if (!carouselRef.current) return;
      const firstChild = carouselRef.current.firstElementChild as HTMLElement;
      if (!firstChild) return;
      const cardWidth = firstChild.offsetWidth + 24;
      carouselRef.current.scrollTo({
        left: idx * cardWidth,
        behavior: "smooth",
      });
      setActiveIndex(idx);
    },
    []
  );

  const handlePrev = () => {
    const nextIdx = activeIndex === 0 ? events.length - 1 : activeIndex - 1;
    scrollToIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % events.length;
    scrollToIndex(nextIdx);
  };

  // Auto-advance every 5 seconds if not hovered and multiple events exist
  useEffect(() => {
    if (isHovered || events.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % events.length;
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
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered, events.length]);

  // If there are no published events, we can omit the section cleanly
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section
      id="workshops-events"
      className="py-16 md:py-24 bg-[#FCF9F2] relative overflow-hidden border-t border-parchment-border/60"
    >
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-gradient-to-bl from-[#FFE885]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#1A3828]/5 via-transparent to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-parchment-border/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed shadow-xs animate-pulse" />
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary text-[11px] font-semibold">
                Community &amp; Academic Outreach
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight leading-[1.15]">
              Workshops, Events &amp; Moments
            </h2>

            <p className="font-body-md text-body-md text-on-surface-variant text-sm sm:text-base leading-relaxed">
              A collection of experiential workshops, university guest lectures,
              and clinical moments in psychology. Fostering emotional resilience,
              empathy, and grounded mental health awareness across institutions and communities.
            </p>
          </div>

          {/* Action buttons & carousel controls */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-primary font-label-md text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-2xs hover:shadow-xs group"
            >
              <span>Explore Gallery</span>
              <ArrowRight className="w-3.5 h-3.5 text-secondary transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            {events.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous event"
                  className="w-10 h-10 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next event"
                  className="w-10 h-10 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          onScroll={updateScrollState}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 -mx-gutter-mobile px-gutter-mobile lg:-mx-gutter-desktop lg:px-gutter-desktop scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="w-[86vw] xs:w-[350px] sm:w-[380px] lg:w-[410px] shrink-0 snap-start flex flex-col"
            >
              <GalleryCard
                event={event}
                onViewEvent={(ev) => setSelectedEvent(ev)}
              />
            </div>
          ))}
        </div>

        {/* Carousel Pagination Indicator & Bottom Invite */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Indicator dots */}
          {events.length > 1 ? (
            <div className="flex items-center gap-2">
              {events.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Jump to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? "w-8 bg-primary"
                      : "w-2 bg-on-surface-variant/30 hover:bg-on-surface-variant/50"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* Invitation banner snippet */}
          <div className="text-xs text-on-surface-variant text-center sm:text-right">
            <span>Want to organize a session at your college or workplace? </span>
            <Link
              href="/inquiry"
              className="text-primary font-semibold hover:text-secondary underline underline-offset-4 decoration-secondary/50 transition-colors"
            >
              Inquire about workshops →
            </Link>
          </div>
        </div>
      </div>

      {/* Modal for viewing event details & photograph lightbox */}
      <GalleryModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
}
