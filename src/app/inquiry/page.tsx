import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnquirySection from "@/components/EnquirySection";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Consultation & Payment Support | Aswathy Jeyarajasekar Counselling",
  description:
    "Have questions before booking or need payment assistance? Reach out directly for confidential support. Personal response from Aswathy within 24-48 hours.",
  keywords: [
    "Counselling inquiry",
    "Therapy consultation support",
    "Aswathy Jeyarajasekar contact",
    "Psychological support Chennai",
    "Online counselling inquiry",
  ],
  alternates: {
    canonical: "https://www.aswathypsychologist.com/inquiry",
  },
  openGraph: {
    title: "Consultation & Payment Support | Aswathy Jeyarajasekar Counselling",
    description:
      "Reach out with any questions regarding sessions, payment arrangements, or consultation formats. Confidential and personal response.",
    url: "https://www.aswathypsychologist.com/inquiry",
    siteName: "Aswathy Jeyarajasekar Counselling Psychology",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.aswathypsychologist.com/aswathy-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Support & Inquiry - Aswathy Jeyarajasekar Counselling Psychology",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Consultation & Payment Support | Aswathy Jeyarajasekar",
    description:
      "Reach out directly with questions before booking your counselling consultation.",
    images: ["https://www.aswathypsychologist.com/aswathy-photo.jpg"],
  },
};

export default function InquiryPage() {
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
        name: "Support & Payment Inquiry",
        item: "https://www.aswathypsychologist.com/inquiry",
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
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
