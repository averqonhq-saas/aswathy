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
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-space-xl">
            <div className="space-y-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-widest">
                  A Private Practice for Wholeness
                </span>
              </div>
              <p className="font-headline-lg text-headline-lg text-surface tracking-tight max-w-xl font-medium">
                Aswathy Counselling Psychology
              </p>
              <p className="font-quote-editorial text-quote-editorial italic text-primary-fixed-dim max-w-lg leading-relaxed pt-space-xs">
                &ldquo;Creating a space to feel heard, understood, and
                respected.&rdquo;
              </p>
            </div>

            <div className="flex flex-col space-y-space-xxs text-on-tertiary-container">
              <span className="font-body-sm text-body-sm font-medium text-surface-bright">
                Aswathy Jeyarajasekar • B.Sc. &amp; M.Sc. Counselling Psychology
              </span>
              <span className="font-body-sm text-xs text-on-tertiary-container">
                In-person clinic in Anna Nagar, Chennai &amp; secure online consultations across India
              </span>
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

          {/* Middle Column: Counselling Services (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-space-md">
            <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-widest block text-xs">
              Counselling Services
            </span>
            <nav className="flex flex-col space-y-2 text-sm text-surface-bright">
              <Link
                href="/services/individual-counselling"
                className="hover:text-secondary-fixed transition-colors py-0.5"
              >
                Individual Counselling in Chennai
              </Link>
              <Link
                href="/services/student-counselling"
                className="hover:text-secondary-fixed transition-colors py-0.5"
              >
                Student &amp; Young Adult Counselling
              </Link>
              <Link
                href="/services/emotional-wellbeing-counselling"
                className="hover:text-secondary-fixed transition-colors py-0.5"
              >
                Emotional Wellbeing &amp; Stress Management
              </Link>
              <Link
                href="/services/relationship-counselling"
                className="hover:text-secondary-fixed transition-colors py-0.5"
              >
                Relationship &amp; Interpersonal Dynamics
              </Link>
              <Link
                href="/services/life-transitions-counselling"
                className="hover:text-secondary-fixed transition-colors py-0.5"
              >
                Life Challenges &amp; Transitions
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-secondary-fixed hover:text-surface-bright pt-1 transition-colors"
              >
                <span>Explore all counselling services</span>
                <span>→</span>
              </Link>
            </nav>
          </div>

          {/* Right Column: Quick Navigation (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-space-lg">
            <div className="space-y-space-md">
              <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-widest block text-xs">
                Explore Sanctuary
              </span>
              <nav className="flex flex-col space-y-2 text-sm text-surface-bright">
                <Link
                  className="hover:text-secondary-fixed transition-colors py-0.5"
                  href="/#about"
                >
                  About the Psychologist
                </Link>
                <Link
                  className="hover:text-secondary-fixed transition-colors py-0.5"
                  href="/#session-journey"
                >
                  What to Expect in a Session
                </Link>
                <Link
                  className="hover:text-secondary-fixed transition-colors py-0.5"
                  href="/#my-approach"
                >
                  Person-Centred Approach
                </Link>
                <Link
                  className="hover:text-secondary-fixed transition-colors py-0.5"
                  href="/#faq"
                >
                  Frequently Asked Questions
                </Link>
                <Link
                  className="hover:text-secondary-fixed transition-colors py-0.5"
                  href="/inquiry"
                >
                  Support &amp; Payment Inquiry
                </Link>
                <Link
                  href="/book-a-session#booking-form"
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-secondary-fixed hover:text-surface-bright pt-1 transition-colors"
                >
                  <span>Book an online counselling session</span>
                  <span>→</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom copyright and accreditation bar */}
        <div className="pt-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-tertiary-container">
          <p>
            © 2026 Aswathy Jeyarajasekar. All rights reserved. Confidential
            &amp; Person-Centered Care.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
            <span className="text-on-tertiary-container">
              Professional Licensure &amp; Ethics Certified
            </span>
            <span className="w-1 h-1 rounded-full bg-on-tertiary-container hidden sm:inline-block"></span>
            <Link
              href="/privacy-policy"
              className="text-surface-bright/80 hover:text-secondary-fixed underline underline-offset-2 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="w-1 h-1 rounded-full bg-on-tertiary-container"></span>
            <Link
              href="/terms-and-conditions"
              className="text-surface-bright/80 hover:text-secondary-fixed underline underline-offset-2 transition-colors duration-200"
            >
              Terms &amp; Policy
            </Link>
            <span className="w-1 h-1 rounded-full bg-on-tertiary-container"></span>
            <a
              href="https://www.averqon.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-tertiary-container hover:text-surface-bright transition-colors duration-200"
            >
              by Averqon
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
