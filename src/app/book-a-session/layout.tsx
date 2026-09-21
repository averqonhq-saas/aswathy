import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Book a Session | Online Counselling Psychologist | Aswathy Jeyarajasekar",
  description:
    "Schedule an empathetic, confidential 50-minute individual counselling consultation. Flexible online telehealth appointments for students, young adults, and working professionals.",
  keywords: [
    "Book counselling session",
    "Psychology appointment",
    "Online counselling booking",
    "Individual therapy session",
    "Student counselling appointment",
    "Aswathy Jeyarajasekar",
  ],
  alternates: {
    canonical: "https://www.aswathypsychologist.com/book-a-session",
  },
  openGraph: {
    title: "Book a Session | Online Counselling Psychologist | Aswathy Jeyarajasekar",
    description:
      "Reserve your confidential consultation at your own pace. Dedicated holding space for emotional wellbeing and personal growth.",
    url: "https://www.aswathypsychologist.com/book-a-session",
    siteName: "Aswathy Jeyarajasekar Counselling Psychology",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.aswathypsychologist.com/aswathy-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Book a Counselling Session with Aswathy Jeyarajasekar",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Session | Aswathy Jeyarajasekar Counselling Psychologist",
    description:
      "Schedule your confidential 50-minute individual counselling consultation online.",
    images: ["https://www.aswathypsychologist.com/aswathy-photo.jpg"],
  },
};

export default function BookASessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        name: "Book a Session",
        item: "https://www.aswathypsychologist.com/book-a-session",
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
