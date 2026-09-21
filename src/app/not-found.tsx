import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Home, Calendar, HelpCircle, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | Aswathy Jeyarajasekar Counselling",
  description:
    "The page you were looking for could not be found. Navigate back to explore counselling services or book an appointment.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="w-full min-h-[calc(100vh-120px)] pt-32 pb-24 bg-surface flex items-center justify-center px-gutter-mobile lg:px-gutter-desktop">
        <div className="max-w-xl mx-auto text-center space-y-space-lg">
          {/* Subtle nature emblem */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-fixed/40 text-primary mb-2 shadow-xs">
            <Compass className="w-8 h-8 text-secondary" />
          </div>

          <div className="space-y-space-xs">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block text-xs">
              404 • Page Not Found
            </span>
            <h1 className="font-headline-xl text-3xl sm:text-4xl text-primary font-semibold tracking-tight">
              This path feels a little <span className="italic">unfamiliar.</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto leading-relaxed pt-2">
              The page you are looking for may have been moved or does not exist.
              Take an unhurried breath — here are a few gentle directions to guide you back.
            </p>
          </div>

          {/* Useful navigation pathways */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-md text-left">
            <Link
              href="/"
              className="p-space-md rounded-2xl bg-surface-container-low border border-parchment-border/60 hover:border-secondary hover:bg-surface-container transition-all flex items-center gap-space-sm group"
            >
              <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Home className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="font-label-md text-sm font-semibold text-primary block">
                  Return to Home
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  Explore practitioner background &amp; philosophy
                </span>
              </div>
            </Link>

            <Link
              href="/book-a-session#booking-form"
              className="p-space-md rounded-2xl bg-surface-container-low border border-parchment-border/60 hover:border-secondary hover:bg-surface-container transition-all flex items-center gap-space-sm group"
            >
              <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="font-label-md text-sm font-semibold text-primary block">
                  Book a Session
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  Reserve your confidential consultation
                </span>
              </div>
            </Link>

            <Link
              href="/#services"
              className="p-space-md rounded-2xl bg-surface-container-low border border-parchment-border/60 hover:border-secondary hover:bg-surface-container transition-all flex items-center gap-space-sm group"
            >
              <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  psychology
                </span>
              </div>
              <div>
                <span className="font-label-md text-sm font-semibold text-primary block">
                  Counselling Services
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  Emotional wellbeing &amp; student support
                </span>
              </div>
            </Link>

            <Link
              href="/inquiry"
              className="p-space-md rounded-2xl bg-surface-container-low border border-parchment-border/60 hover:border-secondary hover:bg-surface-container transition-all flex items-center gap-space-sm group"
            >
              <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="font-label-md text-sm font-semibold text-primary block">
                  Support &amp; Inquiries
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  Have questions before booking?
                </span>
              </div>
            </Link>
          </div>

          <div className="pt-space-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Sanctuary</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
