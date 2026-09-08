"use client";

import { useState } from "react";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";

export default function BookASessionPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-md transition-all duration-300 shadow-[0_1px_8px_rgba(74,51,40,0.04)]">
        <div className="h-20 max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop flex items-center justify-between">
          <Link
            className="flex items-center gap-space-sm group text-left"
            href="/"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Aswathy Logo"
              className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              src="/logo.svg"
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-medium">
                Aswathy Jeyarajasekar
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">
                Counselling Psychologist
              </span>
            </div>
          </Link>

          <nav
            className="hidden md:flex items-center gap-space-xl"
            data-active-classes="text-primary font-semibold underline underline-offset-8 decoration-secondary decoration-2"
          >
            <Link
              className="font-label-caps text-label-caps tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-200 uppercase"
              href="/#about"
            >
              About
            </Link>
            <Link
              className="font-label-caps text-label-caps tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-200 uppercase"
              href="/#services"
            >
              Services
            </Link>
            <Link
              className="font-label-caps text-label-caps tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-200 uppercase"
              href="/#my-approach"
            >
              My Approach
            </Link>
            <Link
              className="font-label-caps text-label-caps tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-200 uppercase"
              href="/#expectations"
            >
              What to Expect
            </Link>
          </nav>

          <div className="flex items-center gap-space-md">
            <Link
              className="hidden sm:inline-flex items-center justify-center px-space-lg py-space-xs rounded-full bg-warm-umber text-surface hover:bg-earth-espresso transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(244,210,66,0.35)] hover:shadow-[0_8px_24px_-4px_rgba(244,210,66,0.55)] group"
              href="#booking-form"
            >
              <span className="font-label-md text-label-md text-surface font-medium">
                Book a Session
              </span>
              <span className="ml-space-xxs text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-primary hover:bg-surface-container rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-tertiary/40 backdrop-blur-sm animate-fadeIn">
          <div className="fixed top-20 right-0 w-4/5 max-w-sm h-[calc(100vh-5rem)] bg-surface shadow-2xl p-space-xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-space-lg pt-space-md">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
                Menu
              </span>
              <nav className="flex flex-col space-y-space-md">
                <Link
                  href="/#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-headline-sm text-headline-sm text-primary hover:text-secondary py-1 flex items-center justify-between border-b border-surface-container pb-2"
                >
                  <span>About Aswathy</span>
                  <ArrowRight className="w-4 h-4 text-secondary-fixed-dim" />
                </Link>
                <Link
                  href="/#services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-headline-sm text-headline-sm text-primary hover:text-secondary py-1 flex items-center justify-between border-b border-surface-container pb-2"
                >
                  <span>Services</span>
                  <ArrowRight className="w-4 h-4 text-secondary-fixed-dim" />
                </Link>
                <Link
                  href="/#my-approach"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-headline-sm text-headline-sm text-primary hover:text-secondary py-1 flex items-center justify-between border-b border-surface-container pb-2"
                >
                  <span>My Approach</span>
                  <ArrowRight className="w-4 h-4 text-secondary-fixed-dim" />
                </Link>
                <Link
                  href="/#expectations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-headline-sm text-headline-sm text-primary hover:text-secondary py-1 flex items-center justify-between border-b border-surface-container pb-2"
                >
                  <span>What to Expect</span>
                  <ArrowRight className="w-4 h-4 text-secondary-fixed-dim" />
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="w-full pt-20 bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* SECTION 1: HEADER & INTRO SPREAD */}
          <section className="relative w-full overflow-hidden bg-surface py-space-3xl lg:py-space-4xl">
            {/* Ambient sunlit morning halo background */}
            <div className="pointer-events-none absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-secondary-fixed/20 blur-[100px] -z-0"></div>
            <div className="pointer-events-none absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-primary-fixed/25 blur-[90px] -z-0"></div>

            <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl lg:gap-space-2xl items-center">
                {/* Left Editorial Intro (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-space-md">
                  <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-space-xxs rounded-full bg-surface-container text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                      Reserve Your Space
                    </span>
                  </div>

                  <h1 className="font-display-hero text-display-hero-mobile lg:text-display-hero text-primary tracking-tight">
                    Take the{" "}
                    <span className="italic font-normal font-headline-xl text-soft-terracotta">
                      first step.
                    </span>
                  </h1>

                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                    If you feel ready to talk, you can book a session at a time
                    that works for you.
                  </p>

                  {/* Reassurance Card with tactile sand base */}
                  <div className="mt-space-sm p-space-lg rounded-xl bg-surface-container-low shadow-[0_4px_24px_rgba(74,51,40,0.03)] flex items-start gap-space-md border border-parchment-border/40">
                    <span
                      className="material-symbols-outlined text-secondary text-[26px] shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      spa
                    </span>
                    <div className="space-y-space-xxs">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary block">
                        Gentle Reassurance
                      </span>
                      <p className="font-quote-editorial text-body-md text-on-surface italic leading-relaxed">
                        &ldquo;You can take things at your own pace. There is no
                        expectation to have everything prepared or resolved
                        before we speak.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Visual Stillness Frame (5 cols) */}
                <div className="lg:col-span-5 relative mt-space-lg lg:mt-0">
                  <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_48px_-12px_rgba(74,51,40,0.12)] bg-surface-container group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-full h-[380px] lg:h-[440px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
                       alt="Aswathy Jeyarajasekar, Counselling Psychologist"
                      src="/aswathy-photo.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent"></div>
                    <div className="absolute bottom-space-lg left-space-lg right-space-lg text-surface p-space-md rounded-xl backdrop-blur-md bg-surface/20">
                      <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-wider block">
                        Private &amp; Grounded Sanctuary
                      </span>
                      <p className="font-body-sm text-body-sm text-surface-bright mt-0.5">
                        100% Online via secure, encrypted Google Meet telehealth anywhere in India or abroad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: INLINE BOOKING FORM */}
          <section
            id="booking-form"
            className="w-full bg-surface-container-low py-space-2xl lg:py-space-3xl scroll-mt-24"
          >
            <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
              <BookingForm />
            </div>
          </section>

          {/* SECTION 3: WHAT TO EXPECT (5-Step Journey & Reassurance Card) */}
          <section className="w-full bg-surface py-space-3xl lg:py-space-4xl">
            <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl">
                {/* Left Title and Comforting Card (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-space-xl">
                  <div className="space-y-space-sm">
                    <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">
                      The Unhurried Path
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                      What to expect
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                      Therapy is not a rigid prescription; it is an organic
                      dialogue. Here is how we gently traverse the therapeutic
                      journey together.
                    </p>
                  </div>

                  {/* Supporting comforting card with visual warmth */}
                  <div className="relative overflow-hidden rounded-2xl bg-surface-container p-space-xl shadow-sm border border-parchment-border/40">
                    <div className="pointer-events-none absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-secondary-fixed/30 blur-2xl"></div>
                    <div className="relative z-10 space-y-space-md">
                      <span className="material-symbols-outlined text-secondary text-[32px]">
                        favorite
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-primary">
                        Confidential, unhurried, and grounded in mutual respect.
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        Whether you wish to unpack long-standing relational
                        dynamics, soothe physical anxious tension, or simply be
                        heard without critique, this container adapts around
                        you.
                      </p>
                      <div className="pt-space-xs flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold text-[12px]">
                        <span>Person-Centered Ethics</span>
                        <span className="text-secondary">✦</span>
                        <span>Trauma-Informed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5-Step Timeline Mosaic (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-space-md">
                  {/* Step 01 */}
                  <div className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors duration-200 flex items-start gap-space-lg border border-transparent hover:border-parchment-border">
                    <span className="font-headline-sm text-headline-md text-secondary-container/80 font-bold shrink-0">
                      01
                    </span>
                    <div className="space-y-space-xxs">
                      <h4 className="font-headline-sm text-body-lg text-primary font-medium">
                        Initial conversation
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        We begin with a warm introductory check-in. We explore
                        what brings you into counselling now, establish your
                        comfort, and answer any questions you have about the
                        process.
                      </p>
                    </div>
                  </div>

                  {/* Step 02 */}
                  <div className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors duration-200 flex items-start gap-space-lg border border-transparent hover:border-parchment-border">
                    <span className="font-headline-sm text-headline-md text-secondary-container/80 font-bold shrink-0">
                      02
                    </span>
                    <div className="space-y-space-xxs">
                      <h4 className="font-headline-sm text-body-lg text-primary font-medium">
                        Understanding your concerns
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Unpacking life contexts, current triggers, and relational
                        patterns without shame or clinical detachment. You share
                        only what feels safe to reveal.
                      </p>
                    </div>
                  </div>

                  {/* Step 03 */}
                  <div className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors duration-200 flex items-start gap-space-lg border border-transparent hover:border-parchment-border">
                    <span className="font-headline-sm text-headline-md text-secondary-container/80 font-bold shrink-0">
                      03
                    </span>
                    <div className="space-y-space-xxs">
                      <h4 className="font-headline-sm text-body-lg text-primary font-medium">
                        Exploring patterns and needs
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Looking closely at underlying defense mechanisms, somatic
                        sensations in your body, and the emotional narratives that
                        shape your everyday decisions.
                      </p>
                    </div>
                  </div>

                  {/* Step 04 */}
                  <div className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors duration-200 flex items-start gap-space-lg border border-transparent hover:border-parchment-border">
                    <span className="font-headline-sm text-headline-md text-secondary-container/80 font-bold shrink-0">
                      04
                    </span>
                    <div className="space-y-space-xxs">
                      <h4 className="font-headline-sm text-body-lg text-primary font-medium">
                        Identifying goals
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Defining what healing, regulation, and clarity mean
                        specifically for you—whether that is setting boundary
                        thresholds or nurturing emotional self-soothing.
                      </p>
                    </div>
                  </div>

                  {/* Step 05 */}
                  <div className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors duration-200 flex items-start gap-space-lg border border-transparent hover:border-parchment-border">
                    <span className="font-headline-sm text-headline-md text-secondary-container/80 font-bold shrink-0">
                      05
                    </span>
                    <div className="space-y-space-xxs">
                      <h4 className="font-headline-sm text-body-lg text-primary font-medium">
                        Working together at your pace
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Continuous, compassionate dialogue supported by tailored
                        grounding practices and reflection markers that honour your
                        individual timeline.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: FAQ / PRACTICAL DETAILS */}
          <section className="w-full bg-surface-container-low py-space-3xl lg:py-space-4xl">
            <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
              <div className="max-w-2xl mx-auto text-center space-y-space-xs mb-space-2xl">
                <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">
                  Clarity &amp; Practicalities
                </span>
                <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Thoughtful answers to help you prepare comfortably for our
                  upcoming session.
                </p>
              </div>

              {/* 3 Thoughtful Editorial Accordion Cards */}
              <div className="max-w-3xl mx-auto space-y-space-md">
                {/* Accordion Item 1 */}
                <details className="group bg-surface rounded-xl shadow-sm overflow-hidden" open>
                  <summary className="flex items-center justify-between p-space-lg cursor-pointer list-none select-none hover:bg-surface-container/50 transition-colors">
                    <span className="font-headline-sm text-body-lg text-primary font-medium flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        devices
                      </span>
                      <span>How do online sessions work?</span>
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform duration-200">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-space-lg pb-space-lg pt-space-xs text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-surface-container-high/40">
                    Sessions are held over a private, end-to-end encrypted video
                    healthcare platform. Once booked, a direct secure meeting link
                    is delivered to your email. No downloads or account
                    registrations are required—simply click the invitation at
                    your scheduled time on a phone, tablet, or laptop.
                  </div>
                </details>

                {/* Accordion Item 2 */}
                <details className="group bg-surface rounded-xl shadow-sm overflow-hidden">
                  <summary className="flex items-center justify-between p-space-lg cursor-pointer list-none select-none hover:bg-surface-container/50 transition-colors">
                    <span className="font-headline-sm text-body-lg text-primary font-medium flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        save_as
                      </span>
                      <span>Can I reschedule if needed?</span>
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform duration-200">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-space-lg pb-space-lg pt-space-xs text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-surface-container-high/40">
                    Life is unpredictable, and therapy should feel supportive
                    rather than punitive. You are warmly welcome to reschedule or
                    modify your appointment anytime up to 24 hours prior via the
                    self-service link inside your confirmation email.
                  </div>
                </details>

                {/* Accordion Item 3 */}
                <details className="group bg-surface rounded-xl shadow-sm overflow-hidden">
                  <summary className="flex items-center justify-between p-space-lg cursor-pointer list-none select-none hover:bg-surface-container/50 transition-colors">
                    <span className="font-headline-sm text-body-lg text-primary font-medium flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        self_improvement
                      </span>
                      <span>How should I prepare for our first meeting?</span>
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform duration-200">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-space-lg pb-space-lg pt-space-xs text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-surface-container-high/40">
                    Simply bring yourself in a comfortable, quiet space where you
                    feel unhurried and can speak freely. Having a warm cup of tea
                    or water nearby is always encouraged. You do not need notes,
                    summaries, or structured goals; we will explore whatever is
                    most present for you.
                  </div>
                </details>
              </div>

              {/* Additional direct contact footnote */}
              <div className="mt-space-2xl text-center">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Have an idiosyncratic scheduling need or question?{" "}
                  <a
                    className="text-primary font-medium underline underline-offset-4 decoration-secondary decoration-2 hover:text-secondary transition-colors"
                    href="mailto:roottherapyonline@gmail.com"
                  >
                    Reach out directly via email (roottherapyonline@gmail.com)
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-tertiary text-surface pt-space-4xl pb-space-2xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl pb-space-3xl border-b border-surface-container/10">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-space-xl">
              <div className="space-y-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                  <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-widest">
                    A Private Practice for Wholeness
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-surface tracking-tight max-w-xl">
                  Aswathy Counselling Psychology
                </h2>
                <p className="font-quote-editorial text-quote-editorial italic text-primary-fixed-dim max-w-lg leading-relaxed pt-space-xs">
                  &ldquo;Creating a space to feel heard, understood, and
                  respected.&rdquo;
                </p>
              </div>
              <div className="flex flex-col space-y-space-xxs text-on-tertiary-container">
                <span className="font-body-sm text-body-sm font-medium text-surface-bright">
                  Registered Counselling Psychologist
                </span>
                <span className="font-body-sm text-body-sm text-on-tertiary-container">
                  Specialized in Anxiety, Relational Dynamics, and Somatic
                  Grounding
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between space-y-space-xl">
              <div className="space-y-space-md">
                <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase tracking-widest block">
                  Explore Sanctuary
                </span>
                <nav className="flex flex-col space-y-space-sm">
                  <Link
                    className="font-body-md text-body-md text-surface-bright hover:text-secondary-fixed transition-colors duration-200 flex items-center justify-between py-space-xxs group text-[14px]"
                    href="/#about"
                  >
                    <span>About Aswathy</span>
                    <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <Link
                    className="font-body-md text-body-md text-surface-bright hover:text-secondary-fixed transition-colors duration-200 flex items-center justify-between py-space-xxs group text-[14px]"
                    href="/#services"
                  >
                    <span>Therapeutic Services</span>
                    <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <Link
                    className="font-body-md text-body-md text-surface-bright hover:text-secondary-fixed transition-colors duration-200 flex items-center justify-between py-space-xxs group text-[14px]"
                    href="/#my-approach"
                  >
                    <span>My Approach &amp; Philosophy</span>
                    <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <Link
                    className="transition-colors duration-200 flex items-center justify-between py-space-xxs group text-secondary-fixed font-semibold text-[14px]"
                    href="/book-a-session"
                  >
                    <span>Book a Consultation</span>
                    <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </nav>
              </div>

              <div className="bg-tertiary-container p-space-lg rounded-xl flex items-center justify-between">
                <div className="space-y-space-xxs">
                  <span className="font-label-caps text-label-caps text-secondary-fixed block">
                    Warm Consultation
                  </span>
                  <span className="font-body-sm text-body-sm text-surface-bright block">
                    100% Online Consultations
                  </span>
                </div>
                <Link
                  className="px-space-md py-space-xs rounded-full bg-surface text-primary font-label-md text-label-md font-medium hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors duration-200 shrink-0"
                  href="#booking-form"
                >
                  Inquire
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-tertiary-container">
            <p>
              © 2025 Aswathy Jeyarajasekar. All rights reserved. Confidential
              &amp; Person-Centered Care.
            </p>
            <div className="flex items-center gap-space-lg">
              <span className="hover:text-surface transition-colors duration-200">
                Professional Licensure &amp; Ethics Certified
              </span>
              <span className="w-1 h-1 rounded-full bg-on-tertiary-container"></span>
              <span className="hover:text-surface transition-colors duration-200">
                Privacy Sanctuary
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
