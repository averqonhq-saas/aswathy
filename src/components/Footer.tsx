"use client";

import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  onOpenBooking?: () => void;
}

export default function Footer({ onOpenBooking }: FooterProps) {
  return (
    <footer className="w-full bg-tertiary text-surface pt-space-4xl pb-space-2xl">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl pb-space-3xl border-b border-surface-container/10">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-space-xl">
            <div className="space-y-space-md">
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-secondary-fixed/40 bg-surface shadow-xs">
                  <Image
                    src="/icon.png"
                    alt="Aswathy Jeyarajasekar Logo"
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                    <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-widest text-xs font-semibold">
                      A Private Practice for Wholeness
                    </span>
                  </div>
                  <span className="font-label-caps text-surface-bright/70 uppercase tracking-wider text-[10px] pt-0.5">
                    Counselling Psychologist
                  </span>
                </div>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-surface tracking-tight max-w-xl font-serif text-3xl sm:text-4xl">
                Aswathy Counselling Psychology
              </h2>
              <p className="font-quote-editorial text-quote-editorial italic text-primary-fixed-dim max-w-lg leading-relaxed pt-space-xs text-base sm:text-lg">
                &ldquo;Creating a space to feel heard, understood, and
                respected.&rdquo;
              </p>
            </div>

          
          </div>

          {/* Right Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-space-xl">
            <div className="space-y-space-md">
              <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-widest block text-xs font-semibold">
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
                  href="/services"
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
                  href="/book-a-session#booking-form"
                >
                  <span>Book a Consultation</span>
                  <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </nav>
            </div>

            <div className="bg-tertiary-container p-space-lg rounded-xl flex items-center justify-between shadow-xs">
              <div className="space-y-space-xxs">
                <span className="font-label-caps text-label-caps text-secondary-fixed block text-xs font-semibold">
                  Warm Consultation
                </span>
                <span className="font-body-sm text-body-sm text-surface-bright block">
                  100% Online Consultations
                </span>
              </div>
              <Link
                className="px-space-md py-space-xs rounded-full bg-surface text-primary font-label-md text-label-md font-medium hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors duration-200 shrink-0 text-sm shadow-xs"
                href="/inquiry"
              >
                Inquire
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright and accreditation bar */}
        <div className="pt-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-tertiary-container text-xs sm:text-sm">
          <p>
            © 2025 Aswathy Jeyarajasekar. All rights reserved. Confidential &amp; Person-Centered Care.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2">
            <span className="hover:text-surface transition-colors duration-200">
              Professional Licensure &amp; Ethics Certified
            </span>
            <span className="w-1 h-1 rounded-full bg-on-tertiary-container"></span>
            <Link
              href="/privacy-policy"
              className="hover:text-surface transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="w-1 h-1 rounded-full bg-on-tertiary-container"></span>
            <Link
              href="/terms-and-conditions"
              className="hover:text-surface transition-colors duration-200"
            >
              Terms &amp; Conditions
            </Link>
            <span className="w-1 h-1 rounded-full bg-on-tertiary-container"></span>
            <a
              href="https://www.averqon.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-fixed hover:text-surface transition-colors duration-200 font-medium"
            >
              Powered by Averqon
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
