import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
  onOpenBooking?: () => void;
}

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-space-xl lg:pt-space-3xl pb-space-3xl lg:pb-space-4xl px-gutter-mobile lg:px-gutter-desktop">
      {/* Ambient sunlit aura decorative elements */}
      <div className="absolute -top-12 -left-20 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full bg-secondary-fixed/20 blur-[100px] pointer-events-none -z-10"></div>

      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-2xl lg:gap-space-3xl items-center">
        {/* Left Column: Editorial Content */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-space-lg">
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-xxs rounded-full bg-surface-container text-on-primary-fixed-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
              Counselling Psychologist
            </span>
          </div>

          <h1 className="font-display-hero text-display-hero-mobile lg:text-display-hero text-primary tracking-tight text-balance leading-tight">
            Counselling Psychologist in Chennai &amp; Online.{" "}
            <span className="italic font-headline-lg lg:font-display-hero text-primary/90 block text-2xl sm:text-3xl lg:text-4xl mt-2 font-normal">
              A space to understand yourself, at your own pace.
            </span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
            Client-centred and empathetic psychological counselling for adolescents,
            young adults, adults, students, and working professionals in Chennai
            and online across India.
          </p>

          <div className="pt-space-xs flex flex-wrap items-center gap-space-md">
            <Link
              href="/book-a-session#booking-form"
              className="inline-flex items-center justify-center px-space-xl py-space-md rounded-full bg-primary-container text-surface-bright hover:bg-primary transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(244,210,66,0.35)] hover:shadow-[0_12px_28px_-4px_rgba(244,210,66,0.55)] group"
            >
              <span className="font-label-md text-label-md font-semibold tracking-wide uppercase">
                Book an Online Counselling Session
              </span>
              <span className="ml-space-xs text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/services"
              className="inline-flex items-center justify-center px-space-xl py-space-md rounded-full bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md font-medium tracking-wide uppercase transition-all duration-200 group"
            >
              <span>Explore Counselling Services</span>
              <span className="ml-space-xs text-on-surface-variant transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* Subtle grounded meta badges */}
          <div className="pt-space-md flex flex-wrap items-center gap-x-space-xl gap-y-space-xs text-on-surface-variant">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                verified_user
              </span>
              <span className="font-body-sm text-body-sm">
                Evidence-informed &amp; Person-centered
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                nature_people
              </span>
              <span className="font-body-sm text-body-sm">
                Gentle, collaborative pace
              </span>
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
