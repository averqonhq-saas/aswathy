export default function ApproachSection() {
  const pillars = [
    {
      num: "01",
      icon: "hearing",
      title: "Be Heard",
      desc: "A space where you can openly express yourself and feel heard, understood, and respected without the fear of being evaluated.",
    },
    {
      num: "02",
      icon: "self_improvement",
      title: "Understand",
      desc: "Explore your thoughts, emotions, experiences, patterns, and needs to discover the roots of how you show up in your world.",
    },
    {
      num: "03",
      icon: "lightbulb",
      title: "Discover",
      desc: "Recognise your innate strengths and develop greater emotional awareness, turning insight into emotional self-trust.",
    },
    {
      num: "04",
      icon: "moving",
      title: "Move Forward",
      desc: "Work towards meaningful, sustainable changes at a pace that feels comfortable, respectful, and wholly yours.",
    },
  ];

  return (
    <section
      id="my-approach"
      className="py-space-3xl lg:py-space-4xl px-gutter-mobile lg:px-gutter-desktop scroll-mt-20"
    >
      <div className="max-w-container-max mx-auto space-y-space-2xl">
        {/* Section Header */}
        <div className="max-w-2xl space-y-space-xs">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
            My Approach
          </span>
          <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
            Therapy should feel like a <span className="italic">conversation.</span>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            A dialogue grounded in curiosity rather than clinical scrutiny,
            designed to help you reconnect with your inner compass.
          </p>
        </div>

        {/* 4 Editorial Horizontal Split Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {pillars.map((pillar) => (
            <div
              key={pillar.num}
              className="p-space-xl rounded-3xl bg-surface-container flex flex-col justify-between space-y-space-xl hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-transparent hover:border-parchment-border"
            >
              <div className="flex items-start justify-between">
                <span className="font-headline-lg text-headline-lg text-secondary-fixed-dim font-light">
                  {pillar.num}
                </span>
                <span className="material-symbols-outlined text-light-clay text-[28px]">
                  {pillar.icon}
                </span>
              </div>
              <div className="space-y-space-xs">
                <h3 className="font-headline-sm text-headline-sm text-primary tracking-tight">
                  {pillar.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
