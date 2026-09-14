import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ApproachSection from "@/components/ApproachSection";
import WhoIWorkWithSection from "@/components/WhoIWorkWithSection";
import SessionJourneySection from "@/components/SessionJourneySection";
import MyJourneySection from "@/components/MyJourneySection";
import ServicesSection from "@/components/ServicesSection";
import { mapDbServiceToDetail } from "@/lib/service-mapper";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import EnquirySection from "@/components/EnquirySection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import { getDatabase } from "@/lib/db";

// Next.js ISR: Revalidate server-rendered page every 60 seconds
export const revalidate = 60;

export default async function Home() {
  let initialAbout = null;
  let initialServices = undefined;
  let initialJourney = undefined;
  let initialSteps = undefined;
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

      if (db.sessionSteps && Array.isArray(db.sessionSteps)) {
        initialSteps = db.sessionSteps
          .filter((s: any) => s.isActive !== false)
          .sort((a: any, b: any) => a.order - b.order)
          .map((s: any, idx: number) => ({
            num: s.stepNumber || String(idx + 1).padStart(2, "0"),
            title: s.title,
            desc: s.description,
          }));
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

  return (
    <>
      <Navbar />
      
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* Hero Section (Next.js Image optimized with priority LCP) */}
          <HeroSection />

          {/* Section 2: Introduction (Server hydrated) */}
          <AboutSection initialAbout={initialAbout} />

          {/* Section 3: My Approach (Pure Server Component) */}
          <ApproachSection />

          {/* Section 4: Who I Work With (Server hydrated) */}
          <WhoIWorkWithSection initialGroups={initialGroups} />

          {/* Section 5: Session Journey (Server hydrated) */}
          <SessionJourneySection initialSteps={initialSteps} />

          {/* Section 6: My Journey (Server hydrated) */}
          <MyJourneySection initialJourney={initialJourney} />

          {/* Section 7: Services (Server hydrated + Lazy loaded modal) */}
          <ServicesSection initialServices={initialServices} />

          {/* Section 8: Words from Clients (Server hydrated) */}
          <TestimonialsSection initialTestimonials={initialTestimonials} />

          {/* Common Inquiries: FAQ Section */}
          <FaqSection />

          {/* Section 9: Direct Consultation Enquiry Form */}
          <EnquirySection />

          {/* Section 10: Immersive Booking Banner CTA (Pure Server Component) */}
          <CtaSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
