"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ServiceDetail } from "./ServiceModal";

const ServiceModal = dynamic(() => import("./ServiceModal"), { ssr: false });

interface ServicesSectionProps {
  onOpenBooking?: (serviceTitle?: string) => void;
  initialServices?: ServiceDetail[];
}

import { mapDbServiceToDetail, type DbService } from "@/lib/service-mapper";
export { mapDbServiceToDetail };

export default function ServicesSection({
  onOpenBooking,
  initialServices,
}: ServicesSectionProps) {
  const [services, setServices] = useState<ServiceDetail[]>(initialServices || []);
  const [isLoading, setIsLoading] = useState(!initialServices || initialServices.length === 0);
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  // Load live active services from Supabase via public API only if not pre-populated
  useEffect(() => {
    if (initialServices && initialServices.length > 0) return;

    let isMounted = true;

    async function loadServices() {
      try {
        const res = await fetch("/api/services");
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
  }, [initialServices]);

  // Handle active slide tracking on manual scroll
  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft } = carouselRef.current;
    const firstChild = carouselRef.current.firstElementChild as HTMLElement;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth + 24; // 24px gap (gap-space-lg)
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), services.length - 1));
  }, [services.length]);

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
    const nextIdx = activeIndex === 0 ? services.length - 1 : activeIndex - 1;
    scrollToIdx(nextIdx);
  };

  const scrollNext = () => {
    const nextIdx = (activeIndex + 1) % services.length;
    scrollToIdx(nextIdx);
  };

  // Auto-roll left to right (advancing sequentially every 4.5s)
  useEffect(() => {
    if (isHovered || services.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % services.length;
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
  }, [isHovered, services.length]);

  return (
    <section
      id="services"
      className="py-space-3xl lg:py-space-4xl px-gutter-mobile lg:px-gutter-desktop scroll-mt-20 overflow-hidden"
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

          <div className="flex items-center gap-4">
            {/* Carousel Arrow Controls */}
            {services.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Previous service"
                  className="w-10 h-10 rounded-full border border-parchment-border bg-surface-container/80 hover:bg-surface-container text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Next service"
                  className="w-10 h-10 rounded-full border border-parchment-border bg-surface-container/80 hover:bg-surface-container text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

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
        </div>

        {/* Categories Carousel */}
        {isLoading ? (
          <div className="flex gap-space-lg overflow-hidden py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[85vw] sm:w-[350px] md:w-[380px] shrink-0 p-space-xl rounded-3xl bg-surface-container/60 h-72 animate-pulse"
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
          <div
            className="relative w-full group/carousel"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
          >
            {/* Carousel Scroll Track */}
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex gap-space-lg overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 no-scrollbar -mx-gutter-mobile lg:-mx-gutter-desktop px-gutter-mobile lg:px-gutter-desktop items-stretch"
            >
              {services.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className="w-[85vw] sm:w-[350px] md:w-[380px] lg:w-[400px] shrink-0 snap-start p-space-xl rounded-3xl bg-surface-container flex flex-col justify-between space-y-space-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-parchment-border/60 hover:border-secondary/50 group/card min-h-[300px]"
                >
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary group-hover/card:bg-primary group-hover/card:text-surface transition-colors shadow-xs">
                        <span className="material-symbols-outlined text-[19px]">
                          {svc.icon}
                        </span>
                      </span>
                      <span className="font-label-caps text-label-caps text-secondary uppercase text-[11px] group-hover/card:text-primary transition-colors flex items-center gap-1">
                        Learn More <span>→</span>
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-primary group-hover/card:text-primary-container transition-colors">
                      {svc.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed line-clamp-3">
                      {svc.summary}
                    </p>
                  </div>
                  <div className="pt-space-xs border-t border-surface-container-high flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-secondary uppercase text-[11px] font-semibold">
                      {svc.badge}
                    </span>
                    <span className="text-[12px] text-on-surface-variant font-body-sm font-medium">
                      {svc.duration} {svc.price ? `• ₹${svc.price}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            {services.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-space-lg">
                {services.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToIdx(idx)}
                    aria-label={`Go to service ${idx + 1}`}
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

