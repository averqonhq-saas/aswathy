"use client";

import React from "react";
import { Sparkles, ArrowDown, Calendar, Award } from "lucide-react";

interface GalleryHeroProps {
  totalPublishedCount: number;
  onExploreClick: () => void;
}

export default function GalleryHero({
  totalPublishedCount,
  onExploreClick,
}: GalleryHeroProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#FCF9F2]">
      {/* Decorative Organic Background Gradients & Shapes */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-tr from-[#FFE885]/25 via-[#F4D242]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-[-100px] w-80 h-80 bg-gradient-to-bl from-[#EFE9DE]/80 via-[#F5EFEB]/50 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-[-60px] w-72 h-72 bg-[#1A3828]/5 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Decorative Subtle Grid / Parchment Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(#412A1E 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-parchment-border/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed shadow-xs animate-pulse" />
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary text-[11px] font-semibold">
              Aswathy Jeyarajasekar • Counselling Psychologist
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-tight leading-[1.12]">
            Workshops, Events &amp; Moments
          </h1>

          {/* Subtitle */}
          <p className="font-body-lg text-body-lg text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            A collection of learning experiences, professional engagements, and
            meaningful moments in psychology. Fostering emotional resilience,
            empathy, and grounded mental health awareness across institutions
            and communities.
          </p>

          {/* Stats & Credential Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-on-surface-variant font-medium">
            <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-xs px-4 py-2 rounded-full border border-parchment-border/60 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-secondary" />
              <span>
                <strong className="text-primary font-bold">
                  {totalPublishedCount > 0 ? `${totalPublishedCount}+` : "Multiple"}
                </strong>{" "}
                Engagements Documented
              </span>
            </div>

            <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-xs px-4 py-2 rounded-full border border-parchment-border/60 shadow-xs">
              <Award className="w-3.5 h-3.5 text-secondary" />
              <span>Colleges, Universities &amp; Community Fora</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-primary text-surface hover:bg-primary-container transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(65,42,30,0.35)] hover:shadow-[0_12px_28px_-6px_rgba(65,42,30,0.5)] font-label-md text-xs sm:text-sm font-semibold uppercase tracking-wider group cursor-pointer"
            >
              <span>Explore Gallery</span>
              <span className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-[#221B00] transition-transform duration-300 group-hover:translate-y-1">
                <ArrowDown className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
