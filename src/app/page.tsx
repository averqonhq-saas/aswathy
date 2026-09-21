import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ApproachSection from "@/components/ApproachSection";
import WhoIWorkWithSection from "@/components/WhoIWorkWithSection";
import MyJourneySection from "@/components/MyJourneySection";
import ServicesSection from "@/components/ServicesSection";
import SessionJourneySection from "@/components/SessionJourneySection";
import { mapDbServiceToDetail } from "@/lib/service-mapper";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import { getDatabase } from "@/lib/db";
import JsonLd from "@/components/JsonLd";
import { DEFAULT_FAQS } from "@/lib/faq-data";

// Next.js ISR: Revalidate server-rendered page every 60 seconds
export const revalidate = 60;

export default async function Home() {
  let initialAbout = null;
  let initialServices = undefined;
  let initialJourney = undefined;
  let initialGroups = undefined;
  let initialTestimonials = undefined;

  try {
    const db = await getDatabase();
    if (db) {
      initialAbout = db.websiteAbout || null;

      if (db.services && Array.isArray(db.services)) {
        initialServices = db.services
          .filter((s: any) => s.status === "active" && !s.deletedAt)
          .sort((a: any, b: any) => a.order - b.order)
          .map((s: any) => mapDbServiceToDetail(s));
      }

      if (db.journeyEntries && Array.isArray(db.journeyEntries)) {
        initialJourney = [...db.journeyEntries].sort((a: any, b: any) => a.order - b.order);
      }

      if (db.clientTypes && Array.isArray(db.clientTypes)) {
        const getIcon = (title: string) => {
          const t = (title || "").toLowerCase();
          if (t.includes("adolescent") || t.includes("teen")) return "face";
          if (t.includes("young") || t.includes("youth")) return "explore";
          if (t.includes("student") || t.includes("academic")) return "school";
          if (t.includes("professional") || t.includes("corporate") || t.includes("work"))
            return "work_outline";
          if (t.includes("relationship") || t.includes("couple")) return "favorite";
          return "person";
        };

        initialGroups = db.clientTypes
          .filter((ct: any) => ct.isActive)
          .sort((a: any, b: any) => a.order - b.order)
          .map((ct: any) => ({
            id: ct.id,
            icon: getIcon(ct.title),
            title: ct.title,
            desc: ct.description,
          }));
      }

      if (db.feedback && Array.isArray(db.feedback)) {
        initialTestimonials = db.feedback
          .filter((fb: any) => fb.status === "approved" && fb.publicVisibility)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((t: any) => ({
            id: t.id,
            quote: t.feedback,
            client: t.isAnonymous ? "Client" : (t.clientDisplayName || "Client"),
            context: t.serviceName || "Individual Counselling",
          }));
      }
    }
  } catch (err) {
    console.error("Server component data hydration error:", err);
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: DEFAULT_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const servicesSchema = initialServices && initialServices.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: initialServices.map((s: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.summary,
        provider: {
          "@type": "Person",
          name: "Aswathy Jeyarajasekar",
        },
        offers: {
          "@type": "Offer",
          price: s.price || 1800,
          priceCurrency: "INR",
        },
      },
    })),
  } : null;

  const pageSchemas = servicesSchema ? [faqSchema, servicesSchema] : [faqSchema];

  return (
    <>
      <JsonLd data={pageSchemas} />
      <Navbar />
      
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* Hero Section (Next.js Image optimized with priority LCP) */}
          <HeroSection />

          {/* Section 2: Introduction (Server hydrated) */}
          <AboutSection initialAbout={initialAbout} />

          {/* Collapsible: Origin & Inspiration (Opened via 'Meet Aswathy' or #journey) */}
          <MyJourneySection initialJourney={initialJourney} />

          {/* Section 3: My Approach (Pure Server Component) */}
          <ApproachSection />

          {/* Section 4: Who I Work With (Server hydrated) */}
          <WhoIWorkWithSection initialGroups={initialGroups} />

          {/* Section 5: What to Expect in a Session */}
          <SessionJourneySection />

          {/* Section 7: Services (Server hydrated + Lazy loaded modal) */}
          <ServicesSection initialServices={initialServices} />

          {/* Section 8: Words from Clients (Server hydrated) */}
          <TestimonialsSection initialTestimonials={initialTestimonials} />

          {/* Common Inquiries: FAQ Section */}
          <FaqSection />

          {/* Section 9: Immersive Booking Banner CTA (Pure Server Component) */}
          <CtaSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
