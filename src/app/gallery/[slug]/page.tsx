import { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import EventDetailClient from "@/components/gallery/EventDetailClient";
import { getGalleryEventBySlug, getGalleryEvents } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getGalleryEventBySlug(slug);

  if (!event || event.status !== "published") {
    return {
      title: "Event Not Found | Aswathy Jeyarajasekar",
    };
  }

  const title = `${event.title} | Aswathy Jeyarajasekar`;
  const description =
    event.shortDescription ||
    `${event.category} conducted at ${event.institution} by Aswathy Jeyarajasekar, Counselling Psychologist.`;

  return {
    title,
    description,
    keywords: [
      event.title,
      event.category,
      event.institution,
      event.role,
      "Aswathy Jeyarajasekar",
      "Counselling Psychologist Chennai",
      ...(event.topics || []),
    ],
    alternates: {
      canonical: `https://www.aswathypsychologist.com/gallery/${event.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.aswathypsychologist.com/gallery/${event.slug}`,
      siteName: "Aswathy Jeyarajasekar Counselling Psychology",
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: event.coverImage,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [event.coverImage],
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getGalleryEventBySlug(slug);

  if (!event || event.status !== "published") {
    notFound();
  }

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
      {
        "@type": "ListItem",
        position: 3,
        name: event.title,
        item: `https://www.aswathypsychologist.com/gallery/${event.slug}`,
      },
    ],
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || event.shortDescription,
    startDate: event.eventDate || undefined,
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
        }
      : {
          "@type": "Place",
          name: event.institution,
        },
    image: [event.coverImage],
    performer: {
      "@type": "Person",
      name: "Aswathy Jeyarajasekar",
      jobTitle: event.role || "Counselling Psychologist",
      url: "https://www.aswathypsychologist.com",
    },
    organizer: {
      "@type": "Organization",
      name: event.institution,
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={eventSchema} />
      <Navbar />
      <main className="min-h-screen bg-[#FCF9F2]">
        <EventDetailClient event={event} />
      </main>
      <Footer />
    </>
  );
}
