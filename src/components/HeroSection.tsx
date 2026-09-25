import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
  onOpenBooking?: () => void;
}

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-6 pb-10 lg:pt-space-3xl lg:pb-space-4xl px-5 sm:px-gutter-mobile lg:px-gutter-desktop">
      {/* Ambient sunlit aura decorative elements */}
      <div className="absolute -top-12 -left-20 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full bg-secondary-fixed/20 blur-[100px] pointer-events-none -z-10"></div>

      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-space-3xl items-center">
        {/* Left Column: Editorial Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-4 lg:space-y-space-lg">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-on-primary-fixed-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim shrink-0"></span>
            <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em' }} className="uppercase text-primary">
              Counselling Psychologist
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-2">
            <h1
              style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                fontSize: 'clamp(1.5rem, 5.5vw, 3.75rem)',
                lineHeight: '1.18',
                letterSpacing: '-0.02em',
                fontWeight: 400,
              }}
              className="text-primary"
            >
              Counselling Psychologist<br className="hidden sm:block" />{" "}
              in Chennai &amp; Online.
            </h1>

            {/* Italic subheading */}
            <p
              style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                fontSize: 'clamp(1rem, 3.8vw, 2rem)',
                lineHeight: '1.35',
                fontWeight: 400,
              }}
              className="italic text-primary/80"
            >
              A space to understand yourself,<br /> at your own pace.
            </p>
          </div>

          {/* Body text */}
          <p
            style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)', lineHeight: '1.7' }}
            className="text-on-surface-variant max-w-lg"
          >
            Client-centred and empathetic psychological counselling for adolescents,
            young adults, adults, students, and working professionals in Chennai
            and online across India.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1">
            <Link
              href="/book-a-session#booking-form"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-container text-surface-bright hover:bg-primary transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(74,51,40,0.25)] hover:shadow-[0_12px_28px_-4px_rgba(74,51,40,0.4)] group"
            >
              <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.07em' }} className="uppercase">
                Book a Session
              </span>
              <span className="text-secondary-container transition-transform duration-200 group-hover:translate-x-1 text-sm">→</span>
            </Link>

            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-parchment-border/70 bg-surface-container-low hover:bg-surface-container text-primary transition-all duration-200 group"
            >
              <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.07em' }} className="uppercase">
                Explore Services
              </span>
              <span className="text-on-surface-variant transition-transform duration-200 group-hover:translate-x-1 text-sm">→</span>
            </Link>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-on-surface-variant pt-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
              <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontSize: '0.8rem' }}>Evidence-informed &amp; Person-centered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">nature_people</span>
              <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontSize: '0.8rem' }}>Gentle, collaborative pace</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sanctuary Image Composition */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          {/* Sunlit backdrop halo accent */}
          <div className="absolute inset-0 max-w-[22rem] max-h-[22rem] m-auto rounded-full bg-secondary-fixed/40 blur-2xl -z-10"></div>

          {/* Frame containing the serene therapy atmosphere */}
          <div className="relative w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-xl bg-surface-container-low group">
            <Image
              src="/aswathy-photo.jpg"
              alt="Aswathy Jeyarajasekar, Counselling Psychologist in Chennai offering online psychological counselling"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tertiary/40 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-space-lg left-space-lg right-space-lg p-space-md rounded-2xl bg-surface/90 backdrop-blur-md shadow-md pointer-events-none">
              <p className="font-quote-editorial text-quote-editorial italic text-primary leading-snug">
                &ldquo;Nothing has to be solved all at once.&rdquo;
              </p>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mt-space-xxs block">
                Quiet Consultation Room
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
