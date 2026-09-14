import Link from "next/link";

interface CtaSectionProps {
  onOpenBooking?: () => void;
}

export default function CtaSection({ onOpenBooking }: CtaSectionProps) {
  return (
    <section className="w-full bg-secondary-container text-on-secondary-container py-space-3xl lg:py-space-4xl px-gutter-mobile lg:px-gutter-desktop relative overflow-hidden">
      {/* Subtle decorative sunlit radiance */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sunlit-glow/30 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none"></div>

      <div className="max-w-container-max mx-auto text-center space-y-space-lg relative z-10">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold block">
          Take the First Step
        </span>
        <h2 className="font-headline-xl text-headline-xl-mobile lg:text-display-hero text-primary tracking-tight max-w-2xl mx-auto">
          Whenever you&apos;re ready, <span className="italic">we can begin.</span>
        </h2>
        <p className="font-body-lg text-body-lg text-primary/80 max-w-xl mx-auto leading-relaxed">
          Take the first step towards understanding yourself in a space that is
          supportive, collaborative, and entirely at your own pace.
        </p>
        <div className="pt-space-sm">
          <Link
            href="/book-a-session#booking-form"
            className="inline-flex items-center justify-center px-space-2xl py-space-md rounded-full bg-primary text-surface font-label-md text-label-md font-semibold uppercase tracking-wider hover:bg-primary-container shadow-xl transition-all duration-300 group"
          >
            <span>Book a Session</span>
            <span className="ml-space-xs text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
