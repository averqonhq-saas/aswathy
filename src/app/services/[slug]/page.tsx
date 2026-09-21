import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { DETAILED_SERVICES, getServiceBySlug } from "@/lib/services-data";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  MapPin,
  ShieldCheck,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return DETAILED_SERVICES.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | Aswathy Counselling",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://www.aswathypsychologist.com/services/${service.slug}`;

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: canonicalUrl,
      siteName: "Aswathy Jeyarajasekar Counselling Psychology",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "https://www.aswathypsychologist.com/aswathy-photo.jpg",
          width: 1200,
          height: 630,
          alt: `${service.name} with Aswathy Jeyarajasekar`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: service.metaTitle,
      description: service.metaDescription,
      images: ["https://www.aswathypsychologist.com/aswathy-photo.jpg"],
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const siblingServices = DETAILED_SERVICES.filter((s) => s.slug !== service.slug);

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
      {
        "@type": "ListItem",
        position: 3,
        name: service.name,
        item: `https://www.aswathypsychologist.com/services/${service.slug}`,
      },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://www.aswathypsychologist.com/services/${service.slug}#service`,
    name: service.name,
    description: service.metaDescription,
    url: `https://www.aswathypsychologist.com/services/${service.slug}`,
    category: service.category,
    provider: {
      "@type": "Person",
      name: "Aswathy Jeyarajasekar",
      jobTitle: "Counselling Psychologist",
      url: "https://www.aswathypsychologist.com",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Chennai",
      },
      {
        "@type": "Country",
        name: "India",
      },
      {
        "@type": "AdministrativeArea",
        name: "Worldwide (Online Telehealth)",
      },
    ],
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbSchema, serviceSchema, faqSchema]} />
      <Navbar />

      <main className="w-full pt-28 lg:pt-36 pb-20 bg-surface min-h-screen">
        <div className="max-w-4xl mx-auto px-gutter-mobile lg:px-gutter-desktop space-y-space-2xl">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-primary transition-colors">
              Services
            </Link>
            <span>/</span>
            <span className="text-on-surface-variant truncate max-w-[200px] sm:max-w-none">
              {service.name}
            </span>
          </nav>

          {/* Header Banner */}
          <header className="space-y-space-md border-b border-parchment-border/70 pb-space-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                {service.icon}
              </span>
              <span>{service.badge}</span>
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl text-primary font-semibold tracking-tight leading-tight">
              {service.h1Title}
            </h1>

            <p className="font-quote-editorial text-lg sm:text-xl text-primary/80 italic leading-relaxed">
              &ldquo;{service.subtitle}&rdquo;
            </p>

            {/* Quick Meta Stats */}
            <div className="pt-space-xs flex flex-wrap items-center gap-space-md text-xs sm:text-sm text-on-surface-variant">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-parchment-border/60">
                <Clock className="w-4 h-4 text-secondary" />
                <span>{service.durationMinutes} Minutes / Session</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-parchment-border/60">
                <Video className="w-4 h-4 text-secondary" />
                <span>Online Telehealth &amp; In-Person (Anna Nagar, Chennai)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-parchment-border/60 font-semibold text-primary">
                <span>Fee: ₹{service.price}</span>
              </div>
            </div>
          </header>

          {/* Core Overview Content (Editorial Narrative) */}
          <section className="space-y-space-md text-on-surface-variant leading-relaxed">
            <h2 className="font-headline-lg text-2xl text-primary font-semibold tracking-tight">
              Understanding {service.name}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
              {service.fullOverview}
            </p>
          </section>

          {/* Who This Service is For */}
          <section className="p-space-xl rounded-3xl bg-surface-container-low border border-parchment-border/60 space-y-space-md">
            <div className="space-y-1">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block text-xs">
                Suitability &amp; Alignment
              </span>
              <h2 className="font-headline-lg text-2xl text-primary font-semibold tracking-tight">
                Who this counselling support is for
              </h2>
            </div>
            <ul className="space-y-2.5 pt-space-xs text-sm sm:text-base text-on-surface-variant">
              {service.whoIsThisFor.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Focus Areas and Key Takeaways Two-Column Layout */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            <div className="p-space-lg rounded-2xl bg-surface-container border border-parchment-border/60 space-y-space-sm">
              <h3 className="font-headline-sm text-lg text-primary font-semibold">
                What We Explore Together
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-on-surface-variant">
                {service.focusAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5"></span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-space-lg rounded-2xl bg-surface-container border border-parchment-border/60 space-y-space-sm">
              <h3 className="font-headline-sm text-lg text-primary font-semibold">
                Therapeutic Takeaways &amp; Growth
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-on-surface-variant">
                {service.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Therapeutic Approach */}
          <section className="p-space-xl rounded-3xl bg-surface-container border border-parchment-border/60 space-y-space-sm">
            <div className="flex items-center gap-2 text-primary font-semibold text-lg">
              <ShieldCheck className="w-5 h-5 text-secondary" />
              <h2>How Sessions Are Conducted</h2>
            </div>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              {service.sessionApproach}
            </p>
            <p className="text-xs sm:text-sm text-on-surface-variant pt-2 border-t border-parchment-border/40">
              Consultations are offered both <strong>100% online via secure Google Meet telehealth</strong> (accessible from anywhere in India and globally) and <strong>in-person in Anna Nagar, Chennai</strong>.
            </p>
          </section>

          {/* Service-Specific FAQs */}
          <section className="space-y-space-lg pt-space-md">
            <div className="space-y-1 text-center max-w-xl mx-auto">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block text-xs">
                Frequently Asked Questions
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Common Questions about {service.name}
              </h2>
            </div>

            <div className="space-y-space-sm">
              {service.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-space-lg rounded-2xl bg-surface-container-low border border-parchment-border/60 space-y-1.5"
                >
                  <h3 className="font-headline-sm text-base text-primary font-medium">
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Direct Booking CTA */}
          <section className="p-space-xl lg:p-space-2xl rounded-3xl bg-secondary-container text-on-secondary-container text-center space-y-space-md shadow-lg">
            <h2 className="font-headline-xl text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
              Ready to begin {service.name.toLowerCase()}?
            </h2>
            <p className="text-sm sm:text-base text-primary/80 max-w-lg mx-auto leading-relaxed">
              Take the first step toward self-clarity and emotional grounding at
              your own comfortable pace.
            </p>
            <div className="pt-space-xs flex flex-wrap justify-center items-center gap-space-md">
              <Link
                href="/book-a-session#booking-form"
                className="inline-flex items-center gap-2 px-space-2xl py-space-md rounded-full bg-primary text-surface font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-primary-container transition-colors shadow-md group"
              >
                <span>Book a Counselling Session</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 px-space-xl py-space-md rounded-full bg-surface-container/70 hover:bg-surface text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider transition-colors"
              >
                <span>Ask a Question</span>
              </Link>
            </div>
          </section>

          {/* Sibling Services Navigation */}
          <section className="pt-space-xl border-t border-parchment-border/70 space-y-space-md">
            <h3 className="font-headline-sm text-base text-primary font-semibold uppercase tracking-wider">
              Other Counselling Services
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {siblingServices.slice(0, 4).map((sib) => (
                <Link
                  key={sib.slug}
                  href={`/services/${sib.slug}`}
                  className="p-space-md rounded-2xl bg-surface-container-low border border-parchment-border/50 hover:border-secondary hover:bg-surface-container transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <span className="font-headline-sm text-sm text-primary font-medium group-hover:text-secondary transition-colors block">
                      {sib.name}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {sib.badge}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-secondary transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </section>

          {/* Return link */}
          <div className="pt-space-sm">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to All Counselling Services</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
