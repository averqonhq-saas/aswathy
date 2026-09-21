import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { DETAILED_SERVICES } from "@/lib/services-data";
import { ArrowRight, Sparkles, Video, MapPin, CheckCircle2, Clock, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Counselling Services in Chennai & Online | Aswathy Jeyarajasekar",
  description:
    "Explore individual, student, relationship, and emotional wellbeing counselling services in Chennai and online. Empathetic, person-centred psychological support.",
  keywords: [
    "Counselling services in Chennai",
    "Psychologist in Chennai",
    "Online counselling India",
    "Student counselling Chennai",
    "Individual counselling Chennai",
    "Mental health counselling in Chennai",
    "Aswathy Jeyarajasekar services",
  ],
  alternates: {
    canonical: "https://www.aswathypsychologist.com/services",
  },
  openGraph: {
    title: "Counselling Services in Chennai & Online | Aswathy Jeyarajasekar",
    description:
      "Client-centred psychological counselling for emotional wellbeing, students, young adults, and life transitions.",
    url: "https://www.aswathypsychologist.com/services",
    siteName: "Aswathy Jeyarajasekar Counselling Psychology",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.aswathypsychologist.com/aswathy-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Counselling Services with Aswathy Jeyarajasekar",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Counselling Services in Chennai & Online | Aswathy Jeyarajasekar",
    description:
      "Explore specialized counselling psychology services in Chennai and online.",
    images: ["https://www.aswathypsychologist.com/aswathy-photo.jpg"],
  },
};

export default function ServicesPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.aswathypsychologist.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: "https://www.aswathypsychologist.com/services",
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Counselling Services Offered by Aswathy Jeyarajasekar",
    itemListElement: DETAILED_SERVICES.map((s, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Service",
        name: s.name,
        description: s.shortSummary,
        url: `https://www.aswathypsychologist.com/services/${s.slug}`,
        provider: {
          "@type": "Person",
          name: "Aswathy Jeyarajasekar",
        },
        offers: {
          "@type": "Offer",
          price: s.price,
          priceCurrency: "INR",
        },
      },
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbSchema, itemListSchema]} />
      <Navbar />

      <main className="w-full pt-28 lg:pt-36 pb-20 bg-surface min-h-screen">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop space-y-space-3xl">
          {/* Editorial Page Header */}
          <header className="max-w-3xl space-y-space-md">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xxs rounded-full bg-surface-container text-on-primary-fixed-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary text-[11px]">
                Specialized Psychological Support
              </span>
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl text-primary font-semibold tracking-tight">
              Counselling Services in Chennai &amp;{" "}
              <span className="italic font-normal text-soft-terracotta">
                Online Therapy
              </span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Every person brings a unique story, emotional climate, and rhythm.
              Our services are grounded in Person-Centered Therapy (PCT) and
              somatic grounding, offering empathetic psychological support for
              adolescents, young adults, adults, students, and working
              professionals.
            </p>

            {/* Modality Badges */}
            <div className="pt-space-xs flex flex-wrap items-center gap-space-md text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-parchment-border/60">
                <Video className="w-4 h-4 text-secondary" />
                <span>100% Confidential Online Telehealth (India &amp; Global)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-parchment-border/60">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>In-Person Consultation • Anna Nagar, Chennai</span>
              </div>
            </div>
          </header>

          {/* Services Grid */}
          <section aria-label="Available Counselling Services" className="space-y-space-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
              {DETAILED_SERVICES.map((svc) => (
                <article
                  key={svc.slug}
                  className="p-space-xl rounded-3xl bg-surface-container-low border border-parchment-border/70 hover:border-secondary/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-space-lg group"
                >
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                        <span className="material-symbols-outlined text-[18px]">
                          {svc.icon}
                        </span>
                        <span>{svc.badge}</span>
                      </span>
                      <span className="text-xs font-medium text-on-surface-variant bg-surface px-2.5 py-1 rounded-full border border-parchment-border/50">
                        {svc.durationMinutes} mins • ₹{svc.price}
                      </span>
                    </div>

                    <h2 className="font-headline-lg text-2xl text-primary font-semibold group-hover:text-secondary transition-colors">
                      <Link href={`/services/${svc.slug}`}>{svc.name}</Link>
                    </h2>

                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {svc.shortSummary}
                    </p>

                    {/* Key Focus Highlights */}
                    <div className="pt-space-xs space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                        Core Focus Areas:
                      </span>
                      <ul className="space-y-1 text-xs text-on-surface-variant">
                        {svc.focusAreas.slice(0, 3).map((focus, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                            <span>{focus}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-space-md border-t border-parchment-border/60 flex items-center justify-between">
                    <Link
                      href={`/services/${svc.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary group-hover:text-secondary transition-colors"
                    >
                      <span>Explore this service</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href="/book-a-session#booking-form"
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary text-surface text-xs font-semibold uppercase tracking-wider hover:bg-primary-container transition-colors shadow-xs"
                    >
                      <span>Book Session</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Consultation Process Section */}
          <section className="p-space-xl lg:p-space-2xl rounded-3xl bg-surface-container border border-parchment-border/60 space-y-space-lg">
            <div className="max-w-2xl space-y-space-xs">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block text-xs">
                How It Works
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Online &amp; In-Person Consultation Formats
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Whether you prefer the convenience of online therapy from your
                home or an in-person consultation in Anna Nagar, Chennai, the
                process remains unhurried, confidential, and client-centred.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-xs">
              <div className="p-space-lg rounded-2xl bg-surface border border-parchment-border/60 space-y-space-xs">
                <div className="flex items-center gap-2 text-primary font-semibold text-base">
                  <Video className="w-5 h-5 text-secondary" />
                  <span>Online Telehealth Sessions</span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Conducted via secure, end-to-end encrypted Google Meet links.
                  Ideal for students, young professionals, and clients across
                  Chennai, Tamil Nadu, nationwide in India, or living abroad.
                </p>
              </div>

              <div className="p-space-lg rounded-2xl bg-surface border border-parchment-border/60 space-y-space-xs">
                <div className="flex items-center gap-2 text-primary font-semibold text-base">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <span>In-Person Consultations</span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Held at a peaceful, confidential consulting space in Anna
                  Nagar, Chennai. In-person slots are scheduled by advance
                  appointment to preserve privacy and quiet reflection.
                </p>
              </div>
            </div>

            <div className="pt-space-sm flex flex-wrap items-center gap-space-md">
              <Link
                href="/book-a-session#booking-form"
                className="inline-flex items-center gap-2 px-space-xl py-space-md rounded-full bg-primary-container text-surface-bright hover:bg-primary transition-all duration-200 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-md"
              >
                <span>Book an Online Counselling Session</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 px-space-xl py-space-md rounded-full bg-surface-container-low hover:bg-surface text-primary text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200"
              >
                <span>Have a Question Before Booking?</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
