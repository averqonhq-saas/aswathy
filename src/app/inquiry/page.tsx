import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnquirySection from "@/components/EnquirySection";

export const metadata: Metadata = {
  title: "Support & Payment Inquiry | Aswathy Jeyarajasekar Counselling",
  description:
    "Reach out for support, payment assistance, consultation inquiries, or questions about therapy sessions. Personal, confidential response within 24-48 hours.",
};

export default function InquiryPage() {
  return (
    <>
      <Navbar />
      <main className="w-full pt-28 lg:pt-32 bg-surface min-h-[calc(100vh-120px)]">
        {/* Back Link Breadcrumb */}
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Support & Payment Inquiry Section Component */}
        <EnquirySection />
      </main>
      <Footer />
    </>
  );
}
