import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ServicesClient from "@/components/ServicesClient";
import { DETAILED_SERVICES } from "@/lib/services-data";

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
      <ServicesClient initialServices={DETAILED_SERVICES} />
      <Footer />
    </>
  );
}
