"use client";

import Link from "next/link";

interface FooterProps {
  onOpenBooking?: () => void;
}

export default function Footer({ onOpenBooking }: FooterProps) {
  return (
    <footer className="w-full bg-tertiary text-surface pt-space-4xl pb-space-2xl">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl pb-space-3xl border-b border-surface-container/10">
          {/* Left Column */}
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
                Registered Qualified Psychologist
              </span>
              {/* <span className="font-body-sm text-body-sm text-on-tertiary-container">
                Specialized in Anxiety, Relational Dynamics, and Somatic Grounding
              </span> */}
              <div className="pt-space-xs flex flex-col sm:flex-row sm:items-center gap-y-1 sm:gap-x-4">
                <a
                  href="mailto:roottherapyonline@gmail.com"
                  className="inline-flex items-center gap-1.5 text-[13px] text-secondary-fixed hover:text-surface-bright transition-colors duration-200"
                >
                  <span>✉ roottherapyonline@gmail.com</span>
                </a>
                <a
                  href="tel:+917550002973"
                  className="inline-flex items-center gap-1.5 text-[13px] text-secondary-fixed hover:text-surface-bright transition-colors duration-200"
                >
                  <span>📞 +91 755 000 2973</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-space-xl">
            <div className="space-y-space-md">
              <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase tracking-widest block">
                Explore Sanctuary
              </span>
              <nav className="flex flex-col space-y-space-sm">
                <a
                  className="text-surface-bright hover:text-secondary-fixed transition-colors duration-200 flex items-center justify-between py-space-xxs group text-[14px]"
                  href="#about"
                >
                  <span>About Aswathy</span>
                  <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </a>
                <a
                  className="font-body-md text-body-md text-surface-bright hover:text-secondary-fixed transition-colors duration-200 flex items-center justify-between py-space-xxs group text-[14px]"
                  href="#services"
                >
                  <span>Therapeutic Services</span>
                  <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </a>
                <a
                  className="font-body-md text-body-md text-surface-bright hover:text-secondary-fixed transition-colors duration-200 flex items-center justify-between py-space-xxs group text-[14px]"
                  href="#my-approach"
                >
                  <span>My Approach &amp; Philosophy</span>
                  <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </a>
                <Link
                  className="font-body-md text-body-md text-surface-bright hover:text-secondary-fixed transition-colors duration-200 flex items-center justify-between py-space-xxs group text-[14px]"
                  href="/inquiry"
                >
                  <span>Support &amp; Payment Inquiry</span>
                  <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  href="/book-a-session#booking-form"
                  className="font-body-md text-body-md text-surface-bright hover:text-secondary-fixed transition-colors duration-200 flex items-center justify-between py-space-xxs group text-left text-[14px]"
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
                  Support &amp; Consultations
                </span>
                <span className="font-body-sm text-body-sm text-surface-bright block">
                  100% Online Consultations
                </span>
              </div>
              <Link
                href="/book-a-session#booking-form"
                className="px-space-md py-space-xs rounded-full bg-surface text-primary font-label-md text-label-md font-medium hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors duration-200 shrink-0"
              >
                Inquire
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright and accreditation bar */}
        <div className="pt-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-tertiary-container">
          <p>
            © 2026 Aswathy Jeyarajasekar. All rights reserved. Confidential
            &amp; Person-Centered Care.
          </p>
          <div className="flex items-center gap-space-lg">
            <span className="hover:text-surface transition-colors duration-200">
              Professional Licensure &amp; Ethics Certified
            </span>
            <span className="w-1 h-1 rounded-full bg-on-tertiary-container"></span>
            <span className="hover:text-surface transition-colors duration-200">
              Privacy
            </span>
            <a href="https://www.averqon.in/" target="blank" >
            <span className="hover:text-surface transition-colors duration-200">
              by Averqon
            </span></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
