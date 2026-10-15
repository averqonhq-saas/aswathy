import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import GalleryClient from "@/components/gallery/GalleryClient";
import { getGalleryEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Workshops, Events & Professional Moments | Aswathy Jeyarajasekar Counselling Psychologist",
  description:
    "Explore educational workshops, guest lectures, seminars, and awareness programmes by Aswathy Jeyarajasekar, Counselling Psychologist in Chennai. Empowering student & community wellbeing.",
  keywords: [
    "Aswathy Jeyarajasekar workshops",
    "Psychology guest lectures Chennai",
    "Student mental health seminars Chennai",
    "Corporate wellness workshops",
    "World Mental Health Day events Chennai",
    "Counselling psychologist speaker Chennai",
    "Psychology awareness programmes",
    "Emotional resilience workshop",
  ],
  alternates: {
    canonical: "https://www.aswathypsychologist.com/gallery",
  },
  openGraph: {
    title:
      "Workshops, Events & Professional Moments | Aswathy Jeyarajasekar",
    description:
      "A collection of experiential workshops, seminars, and academic engagements fostering mental health awareness and empathy.",
    url: "https://www.aswathypsychologist.com/gallery",
    siteName: "Aswathy Jeyarajasekar Counselling Psychology",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.aswathypsychologist.com/aswathy-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Aswathy Jeyarajasekar Psychology Workshops & Events",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Workshops, Events & Moments | Aswathy Jeyarajasekar",
    description:
      "A collection of learning experiences, professional engagements, and meaningful moments in psychology.",
    images: ["https://www.aswathypsychologist.com/aswathy-photo.jpg"],
  },
};

export default async function GalleryPage() {
  const publishedEvents = await getGalleryEvents({ status: "published" });

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
        name: "Gallery & Events",
        item: "https://www.aswathypsychologist.com/gallery",
      },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Workshops, Events & Moments in Psychology",
    description:
      "A collection of learning experiences, professional engagements, and meaningful moments in psychology by Aswathy Jeyarajasekar.",
    url: "https://www.aswathypsychologist.com/gallery",
    author: {
      "@type": "Person",
      name: "Aswathy Jeyarajasekar",
      jobTitle: "Counselling Psychologist",
      url: "https://www.aswathypsychologist.com",
    },
    hasPart: publishedEvents.map((e) => ({
      "@type": "Event",
      name: e.title,
      description: e.shortDescription,
      startDate: e.eventDate || undefined,
      location: e.location
        ? {
            "@type": "Place",
            name: e.location,
          }
        : undefined,
      image: e.coverImage,
      url: `https://www.aswathypsychologist.com/gallery/${e.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <Navbar />
      <main className="min-h-screen bg-[#FCF9F2]">
        <Suspense
          fallback={
            <div className="py-32 text-center text-on-surface-variant/60 font-body-md text-sm">
              Loading moments & events...
            </div>
          }
        >
          <GalleryClient initialEvents={publishedEvents} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
