"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ApproachSection from "@/components/ApproachSection";
import WhoIWorkWithSection from "@/components/WhoIWorkWithSection";
import SessionJourneySection from "@/components/SessionJourneySection";
import MyJourneySection from "@/components/MyJourneySection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* Hero Section */}
          <HeroSection />

          {/* Section 2: Introduction (A Little About Me) */}
          <AboutSection />

          {/* Section 3: My Approach (4 Pillars) */}
          <ApproachSection />

          {/* Section 4: Who I Work With */}
          <WhoIWorkWithSection />

          {/* Section 5: Session Journey (What to Expect) */}
          <SessionJourneySection />

          {/* Section 6: My Journey (Origin & Inspiration) */}
          <MyJourneySection />

          {/* Section 7: Services (Areas of Specialization + Detail Modals) */}
          <ServicesSection />

          {/* Section 8: Words from Clients (Testimonials) */}
          <TestimonialsSection />

          {/* Common Inquiries: FAQ Section */}
          <FaqSection />

          {/* Section 9: Immersive Booking Banner CTA */}
          <CtaSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
