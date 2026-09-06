"use client";

export default function MyJourneySection() {
  return (
    <section
      id="journey"
      className="py-space-3xl lg:py-space-4xl bg-surface-container-low px-gutter-mobile lg:px-gutter-desktop scroll-mt-20"
    >
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
        <div className="lg:col-span-5 space-y-space-md">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
            Origin &amp; Inspiration
          </span>
          <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
            How I found my way to <span className="italic">psychology.</span>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Her journey began in 11th grade, when she experienced the impact of
            receiving professional psychological support during a difficult
            phase of her life. That experience sparked her interest in
            psychology and eventually shaped her academic and professional
            journey.
          </p>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-space-md">
          {/* Visual Timeline */}
          <div className="p-space-xl rounded-3xl bg-surface shadow-sm space-y-space-lg">
            {/* Catalyst */}
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed/40 flex items-center justify-center text-primary font-headline-sm shrink-0">
                ★
              </div>
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                  The Catalyst
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  11th Grade &amp; Personal Therapy Experience
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Realizing how healing it is to have an unbiased, safe
                  listener.
                </p>
              </div>
            </div>

            <div className="pl-6 ml-6 h-6 border-l-2 border-dashed border-secondary-fixed"></div>

            {/* Education */}
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary font-headline-sm shrink-0">
                <span className="material-symbols-outlined text-[20px] text-warm-umber">
                  menu_book
                </span>
              </div>
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                  Education
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  B.Sc. &amp; M.Sc. in Counselling Psychology
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  In-depth training in clinical foundations, therapeutic ethics,
                  and human development.
                </p>
              </div>
            </div>

            <div className="pl-6 ml-6 h-6 border-l-2 border-dashed border-secondary-fixed"></div>

            {/* Today */}
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-full bg-primary-container text-surface flex items-center justify-center font-headline-sm shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[20px] text-surface">
                  spa
                </span>
              </div>
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                  Today
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  Dedicated Private Practice
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Offering thoughtful counselling sessions for adolescents,
                  young adults, and adults worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
