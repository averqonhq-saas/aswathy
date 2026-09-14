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
      className="py-space-3xl lg:py-space-4xl bg-surface-container-low px-gutter-mobile lg:px-gutter-desktop scroll-mt-20"
    >
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-2xl lg:gap-space-3xl items-center">
        {/* Left Column: Heading & Premise */}
        <div className="lg:col-span-5 space-y-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
              A Little About Me
            </span>
          </div>

          <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
            Someone to listen,{" "}
            <span className="italic text-primary/85">without judgement.</span>
          </h2>

          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {about?.shortIntro ||
              "Therapy is a sanctuary where vulnerability meets safety. You will never be rushed to explain what you are not yet ready to articulate."}
          </p>

          <div className="pt-space-sm">
            <button
              type="button"
              onClick={handleToggleJourney}
              className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold uppercase tracking-wider group cursor-pointer"
              aria-expanded={isJourneyOpen}
            >
              <span className="underline underline-offset-8 decoration-secondary-fixed-dim decoration-2 group-hover:decoration-primary transition-all duration-200">
                {isJourneyOpen
                  ? `Hide ${about?.name ? about.name.split(" ")[0] : "Aswathy"}'s Journey`
                  : `Meet ${about?.name ? about.name.split(" ")[0] : "Aswathy"}`}
              </span>
              <span
                className={`text-secondary transition-transform duration-200 ${
                  isJourneyOpen ? "-rotate-90" : "group-hover:translate-x-1"
                }`}
              >
                {isJourneyOpen ? "↑" : "→"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Portrait & Biographical Card */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-space-lg items-center">
          <div className="sm:col-span-6 relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg bg-surface-container group">
            <Image
              alt={
                about?.name
                  ? `${about.name}, ${about.title || "Counselling Psychologist"}`
                  : "Aswathy Jeyarajasekar, Counselling Psychologist"
              }
              src={about?.profileImage || "/aswathy-photo2.jpg"}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 350px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="sm:col-span-6 flex flex-col justify-between space-y-space-md p-space-lg rounded-3xl bg-surface shadow-sm">
            <div className="space-y-space-sm">
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block">
                Credentials &amp; Core Belief
              </span>
              <p className="font-body-md text-body-md font-medium text-primary">
                {about?.name
                  ? `I’m ${about.name}, a ${about.title || "Counselling Psychologist"}${
                      about.qualifications && about.qualifications.length > 0
                        ? ` with ${about.qualifications.join(" and ")}.`
                        : "."
                    }`
                  : "I’m Aswathy Jeyarajasekar, a Counselling Psychologist with a B.Sc. in Psychology and an M.Sc. in Counselling Psychology."}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {about?.fullBio ||
                  "I believe therapy is not about telling someone what they should do or how they should feel. Instead, it is a collaborative process of understanding yourself, exploring your experiences, recognising your strengths, and working towards changes that feel meaningful to you."}
              </p>
            </div>

            <div className="pt-space-xs flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  psychology_alt
                </span>
              </div>
              <div>
                <div className="font-label-md text-label-md font-semibold text-primary">
                  Person-Centered Practice
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">
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
