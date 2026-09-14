"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { WebsiteAboutContent } from "@/lib/types";

interface AboutSectionProps {
  initialAbout?: WebsiteAboutContent | null;
}

export default function AboutSection({ initialAbout }: AboutSectionProps) {
  const [about, setAbout] = useState<WebsiteAboutContent | null>(initialAbout || null);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  useEffect(() => {
    const handleState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      if (customEvent.detail !== undefined) {
        setIsJourneyOpen(customEvent.detail.isOpen);
      }
    };
    window.addEventListener("journey-state-change", handleState);
    if (typeof window !== "undefined" && window.location.hash === "#journey") {
      setIsJourneyOpen(true);
    }
    return () => window.removeEventListener("journey-state-change", handleState);
  }, []);

  const handleToggleJourney = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextState = !isJourneyOpen;
    setIsJourneyOpen(nextState);
    window.dispatchEvent(
      new CustomEvent("journey-state-change", { detail: { isOpen: nextState } })
    );

    if (nextState) {
      setTimeout(() => {
        const el = document.getElementById("journey");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  useEffect(() => {
    // Only fetch client-side if not pre-populated via Server Component
    if (initialAbout) return;

    let isMounted = true;
    async function loadAbout() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.about) {
          setAbout(data.about);
        }
      } catch (err) {
        console.error("Failed to load about section content:", err);
      }
    }
    loadAbout();
    return () => {
      isMounted = false;
    };
  }, [initialAbout]);

  return (
    <section
      id="about"
      className="py-space-2xl lg:py-space-3xl bg-surface-container-low px-gutter-mobile lg:px-gutter-desktop scroll-mt-20"
    >
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-space-xl items-center">
        {/* Left Column: Heading & Premise */}
        <div className="lg:col-span-5 space-y-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant text-[11px]">
              A Little About Me
            </span>
          </div>

          <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary tracking-tight">
            Someone to listen,{" "}
            <span className="italic text-primary/85">without judgement.</span>
          </h2>

          <p className="font-body-sm text-body-sm sm:text-body-md text-on-surface-variant leading-relaxed">
            {about?.shortIntro ||
              "Therapy is a sanctuary where vulnerability meets safety. You will never be rushed to explain what you are not yet ready to articulate."}
          </p>

          <div className="pt-space-xs">
            <button
              type="button"
              onClick={handleToggleJourney}
              className="inline-flex items-center gap-2 text-primary font-label-md text-label-md font-semibold uppercase tracking-wider group cursor-pointer transition-colors duration-200"
              aria-expanded={isJourneyOpen}
            >
              <span className="underline underline-offset-8 decoration-secondary-fixed-dim decoration-2 group-hover:decoration-primary transition-all duration-200">
                {isJourneyOpen
                  ? `Hide ${about?.name ? about.name.split(" ")[0] : "Aswathy"}'s Journey`
                  : `Meet ${about?.name ? about.name.split(" ")[0] : "Aswathy"}`}
              </span>
              <span
                className={`text-secondary transition-transform duration-300 ease-out ${
                  isJourneyOpen ? "-rotate-90" : "group-hover:translate-x-1.5"
                }`}
              >
                {isJourneyOpen ? "↑" : "→"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Portrait & Biographical Card */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-space-md sm:gap-space-lg items-center">
          <div className="sm:col-span-5 relative aspect-[4/5] max-h-[350px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-surface-container group">
            <Image
              alt={
                about?.name
                  ? `${about.name}, ${about.title || "Counselling Psychologist"}`
                  : "Aswathy Jeyarajasekar, Counselling Psychologist"
              }
              src={about?.profileImage || "/aswathy-photo2.jpg"}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          <div className="sm:col-span-7 flex flex-col justify-between space-y-space-sm p-space-md sm:p-space-lg rounded-2xl bg-surface shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-parchment-border/50 hover:border-secondary-fixed-dim/60 group/card">
            <div className="space-y-space-xs">
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest text-[11px] block">
                Credentials &amp; Core Belief
              </span>
              <p className="font-body-md text-body-md font-semibold text-primary leading-snug">
                {about?.name
                  ? `I’m ${about.name}, a ${about.title || "Counselling Psychologist"}${
                      about.qualifications && about.qualifications.length > 0
                        ? ` with ${about.qualifications.join(" and ")}.`
                        : "."
                    }`
                  : "I’m Aswathy Jeyarajasekar, a Counselling Psychologist with a B.Sc. in Psychology and an M.Sc. in Counselling Psychology."}
              </p>
              <p className="font-body-sm text-xs sm:text-[13px] text-on-surface-variant leading-relaxed">
                {about?.fullBio ||
                  "I believe therapy is not about telling someone what they should do or how they should feel. Instead, it is a collaborative process of understanding yourself, exploring your experiences, recognising your strengths, and working towards changes that feel meaningful to you."}
              </p>
            </div>

            <div className="pt-space-xs flex items-center gap-space-xs border-t border-surface-container-high/70">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0 transition-transform duration-300 group-hover/card:scale-110">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  psychology_alt
                </span>
              </div>
              <div>
                <div className="font-label-md text-xs font-semibold text-primary">
                  Person-Centered Practice
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">
                  {about?.experienceYears || "Rooted in mutual trust & patience"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
