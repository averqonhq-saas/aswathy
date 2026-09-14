"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
