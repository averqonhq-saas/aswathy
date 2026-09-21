"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Video,
  Globe,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { DETAILED_SERVICES, DetailedService } from "@/lib/services-data";

interface ServicesClientProps {
  initialServices?: DetailedService[];
}

export default function ServicesClient({
  initialServices = DETAILED_SERVICES,
}: ServicesClientProps) {
  // Clinical Services state
  const [detailedServices, setDetailedServices] = useState<DetailedService[]>(initialServices);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch dynamic clinical services from API
  useEffect(() => {
    async function loadDynamicServices() {
      try {
        const servicesRes = await fetch("/api/services", { cache: "no-store" });

        if (servicesRes.ok) {
          const svcData = await servicesRes.json();
          if (Array.isArray(svcData.services) && svcData.services.length > 0) {
            // Merge with detailed services if matches exist
            const merged = svcData.services.map((liveSvc: any) => {
              const matchedDetailed = initialServices.find(
                (ds) =>
                  ds.slug === liveSvc.id ||
                  ds.name.toLowerCase() === liveSvc.name.toLowerCase() ||
                  liveSvc.id.includes(ds.slug)
              );

              if (matchedDetailed) {
                return {
                  ...matchedDetailed,
                  name: liveSvc.name || matchedDetailed.name,
                  price: liveSvc.price ?? matchedDetailed.price,
                  durationMinutes: liveSvc.durationMinutes ?? matchedDetailed.durationMinutes,
                  shortSummary: liveSvc.shortDescription || matchedDetailed.shortSummary,
                  category: liveSvc.categoryName || matchedDetailed.category,
                };
              }

              // Fallback mapped detailed service
              return {
                slug: liveSvc.id,
                name: liveSvc.name,
                category: liveSvc.categoryName || "Counselling Psychology",
                badge: "Empathetic Care",
                icon: "psychology",
                metaTitle: `${liveSvc.name} | Aswathy Jeyarajasekar`,
                metaDescription: liveSvc.shortDescription || liveSvc.name,
                h1Title: liveSvc.name,
                subtitle: liveSvc.shortDescription || "",
                shortSummary: liveSvc.shortDescription || "",
                fullOverview: liveSvc.fullDescription || liveSvc.shortDescription || "",
                whoIsThisFor: [
                  "Individuals experiencing emotional distress or life transitions",
                  "Students and working professionals seeking clarity and relief",
                  "Anyone wanting a safe, confidential space to unpack concerns",
                ],
                focusAreas: [
                  "Navigating emotional regulation & stress patterns",
                  "Developing somatic grounding & self-compassion",
                  "Establishing sustainable personal boundaries",
                ],
                keyTakeaways: [
                  "Clarified perspective and tangible grounding practices",
                  "Safe emotional decompression without judgment",
                ],
                sessionApproach:
                  "Grounded in client-centred therapy and somatic awareness, tailored to your pace.",
                faqs: [],
                durationMinutes: liveSvc.durationMinutes || 50,
                price: liveSvc.price || 1800,
                format: "100% Online (Google Meet Telehealth)",
                locationDetails: "Online Telehealth (Across India & Worldwide)",
              } as DetailedService;
            });

            if (merged.length > 0) {
              setDetailedServices(merged);
            }
          }
        }
      } catch {
        // Fallback gracefully to default initialServices
      }
    }

    loadDynamicServices();
  }, [initialServices]);

  // Extract unique categories for filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    detailedServices.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [detailedServices]);

  // Filtered services
  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return detailedServices;
    return detailedServices.filter((s) => s.category === selectedCategory);
  }, [detailedServices, selectedCategory]);

  return (
    <main className="w-full pt-28 lg:pt-36 pb-20 bg-surface min-h-screen">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop space-y-space-3xl">
        {/* Editorial Page Header */}
        <header className="max-w-3xl space-y-space-md">
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-xxs rounded-full bg-surface-container text-on-primary-fixed-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary text-[11px]">
              Specialized Psychological Support
            </span>
          </div>

          <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl text-primary font-semibold tracking-tight">
            Counselling Services in Chennai &amp;{" "}
            <span className="italic font-normal text-soft-terracotta">
              Online Therapy
            </span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Every person brings a unique story, emotional climate, and rhythm.
            Our consultations are grounded in Person-Centered Therapy (PCT) and
            somatic grounding, offering empathetic psychological support for
            adolescents, young adults, adults, students, and working
            professionals.
          </p>

          {/* Modality Badges */}
          <div className="pt-space-xs flex flex-wrap items-center gap-space-md text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-parchment-border/60">
              <Video className="w-4 h-4 text-secondary" />
              <span>100% Confidential Online Telehealth (India &amp; Global)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-parchment-border/60">
              <Globe className="w-4 h-4 text-secondary" />
              <span>Accessible Across Chennai, India &amp; Worldwide</span>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* CLINICAL SERVICES LIST                                       */}
        {/* ============================================================ */}
        <section aria-label="Available Counselling Services" className="space-y-space-xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block text-xs">
                Therapeutic Areas
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Counselling Services &amp; Focus Areas
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Compassionate, confidential online psychological support across India and globally.
              </p>
            </div>

            {/* Category Filter Pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-primary text-surface shadow-xs font-semibold"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high border border-parchment-border/60"
                  }`}
                >
                  All Focus Areas ({detailedServices.length})
                </button>
                {categories.map((cat) => {
                  const count = detailedServices.filter((s) => s.category === cat).length;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-primary text-surface shadow-xs font-semibold"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high border border-parchment-border/60"
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="ml-1.5 text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
            {filteredServices.map((svc) => (
              <article
                key={svc.slug}
                className="p-space-xl rounded-3xl bg-surface-container-low border border-parchment-border/70 hover:border-secondary/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-space-lg group"
              >
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                      <span className="material-symbols-outlined text-[18px]">
                        {svc.icon}
                      </span>
                      <span>{svc.badge}</span>
                    </span>
                    <span className="text-xs font-medium text-on-surface-variant bg-surface px-2.5 py-1 rounded-full border border-parchment-border/50">
                      {svc.durationMinutes} mins • ₹{svc.price}
                    </span>
                  </div>

                  <h3 className="font-headline-lg text-2xl text-primary font-semibold group-hover:text-secondary transition-colors">
                    <Link href={`/services/${svc.slug}`}>{svc.name}</Link>
                  </h3>

                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {svc.shortSummary}
                  </p>

                  {/* Key Focus Highlights */}
                  <div className="pt-space-xs space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                      Core Focus Areas:
                    </span>
                    <ul className="space-y-1 text-xs text-on-surface-variant">
                      {svc.focusAreas.slice(0, 3).map((focus, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                          <span>{focus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-space-md border-t border-parchment-border/60 flex items-center justify-between">
                  <Link
                    href={`/services/${svc.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary group-hover:text-secondary transition-colors"
                  >
                    <span>Explore this service</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href={`/book-a-session?service=${svc.slug}#booking-form`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary text-surface text-xs font-semibold uppercase tracking-wider hover:bg-primary-container transition-colors shadow-xs"
                  >
                    <span>Book Session</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* HOW IT WORKS / ONLINE TELEHEALTH EXCELLENCE                  */}
        {/* ============================================================ */}
        <section className="p-space-xl lg:p-space-2xl rounded-3xl bg-surface-container border border-parchment-border/60 space-y-space-lg">
          <div className="max-w-2xl space-y-space-xs">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block text-xs">
              Consultation Quality
            </span>
            <h2 className="font-headline-xl text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
              100% Online Consultation Format
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              All consultations are conducted online through secure Google Meet video sessions,
              providing an unhurried, confidential, and client-centred space from the comfort of your own environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-xs">
            <div className="p-space-lg rounded-2xl bg-surface border border-parchment-border/60 space-y-space-xs">
              <div className="flex items-center gap-2 text-primary font-semibold text-base">
                <Video className="w-5 h-5 text-secondary" />
                <span>Secure Telehealth Video</span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Conducted via secure, end-to-end encrypted Google Meet links.
                Ideal for students, young professionals, and clients across
                Chennai, Tamil Nadu, nationwide in India, or living abroad.
              </p>
            </div>

            <div className="p-space-lg rounded-2xl bg-surface border border-parchment-border/60 space-y-space-xs">
              <div className="flex items-center gap-2 text-primary font-semibold text-base">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span>Comfort, Privacy &amp; Zero Commute</span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Connect from the quiet sanctuary of your own home without the stress
                of travel or waiting rooms. All sessions maintain standard professional confidentiality.
              </p>
            </div>
          </div>

          <div className="pt-space-sm flex flex-wrap items-center gap-space-md">
            <Link
              href="/book-a-session#booking-form"
              className="inline-flex items-center gap-2 px-space-xl py-space-md rounded-full bg-primary-container text-surface-bright hover:bg-primary transition-all duration-200 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-md"
            >
              <span>Book an Online Counselling Session</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/inquiry"
              className="inline-flex items-center gap-2 px-space-xl py-space-md rounded-full bg-surface-container-low hover:bg-surface text-primary text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200"
            >
              <span>Have a Question Before Booking?</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
