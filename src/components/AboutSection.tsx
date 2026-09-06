"use client";

export default function AboutSection() {
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
            Therapy is a sanctuary where vulnerability meets safety. You will
            never be rushed to explain what you are not yet ready to
            articulate.
          </p>

          <div className="pt-space-sm">
            <a
              className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold uppercase tracking-wider group"
              href="#journey"
            >
              <span className="underline underline-offset-8 decoration-secondary-fixed-dim decoration-2 group-hover:decoration-primary transition-all duration-200">
                Meet Aswathy
              </span>
              <span className="text-secondary transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>

        {/* Right Column: Portrait & Biographical Card */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-space-lg items-center">
          <div className="sm:col-span-6 relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg bg-surface-container group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Aswathy Jeyarajasekar, Counselling Psychologist"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src="/aswathy-photo.jpg"
            />
          </div>

          <div className="sm:col-span-6 flex flex-col justify-between space-y-space-md p-space-lg rounded-3xl bg-surface shadow-sm">
            <div className="space-y-space-sm">
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block">
                Credentials &amp; Core Belief
              </span>
              <p className="font-body-md text-body-md font-medium text-primary">
                I’m Aswathy Jeyarajasekar, a Counselling Psychologist with a
                B.Sc. in Psychology and an M.Sc. in Counselling Psychology.
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                I believe therapy is not about telling someone what they should
                do or how they should feel. Instead, it is a collaborative
                process of understanding yourself, exploring your experiences,
                recognising your strengths, and working towards changes that feel
                meaningful to you.
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
                  Rooted in mutual trust &amp; patience
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
