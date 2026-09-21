import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: {
    default: "Counselling Psychologist in Chennai | Aswathy Jeyarajasekar",
    template: "%s | Aswathy Jeyarajasekar",
  },
  description:
    "Connect with Aswathy Jeyarajasekar, a Counselling Psychologist offering client-centred and individualised counselling support for adolescents, young adults, adults, students and working professionals.",
  keywords: [
    "Counselling Psychologist",
    "Counselling Psychologist Chennai",
    "Counselling Psychologist near me",
    "Online Counselling",
    "Online Psychological Counselling",
    "Mental Health Counselling",
    "Individual Counselling",
    "Student Counselling",
    "Young Adult Counselling",
    "Adult Counselling",
    "Emotional Wellbeing",
    "Psychological Support",
    "Counselling Sessions",
    "Aswathy Jeyarajasekar",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.aswathypsychologist.com"
  ),
  alternates: {
    canonical: "https://www.aswathypsychologist.com",
  },
  authors: [{ name: "Aswathy Jeyarajasekar", url: "https://www.aswathypsychologist.com" }],
  creator: "Aswathy Jeyarajasekar",
  publisher: "Aswathy Jeyarajasekar Counselling Psychology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Aswathy Jeyarajasekar | Counselling Psychologist in Chennai & Online",
    description:
      "A compassionate, non-judgmental space for emotional wellbeing, personal growth, and navigating life challenges at your own pace.",
    url: "https://www.aswathypsychologist.com",
    siteName: "Aswathy Jeyarajasekar Counselling Psychology",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.aswathypsychologist.com/aswathy-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Aswathy Jeyarajasekar, Counselling Psychologist",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aswathy Jeyarajasekar | Counselling Psychologist in Chennai & Online",
    description:
      "Empathetic, individualised psychological counselling for adolescents, young adults, students, and working professionals.",
    images: [
      {
        url: "https://www.aswathypsychologist.com/aswathy-photo.jpg",
        alt: "Aswathy Jeyarajasekar, Counselling Psychologist",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "J0tXxJ6KuD1VTOHu2fWwhKdxjxseC9gd_wtD5h7rXs4",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcf9f2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://www.aswathypsychologist.com/#website",
      url: "https://www.aswathypsychologist.com",
      name: "Aswathy Jeyarajasekar Counselling Psychology",
      description:
        "Client-centred, empathetic counselling psychology practice offering in-person consultations in Chennai and secure online counselling across India.",
      inLanguage: "en-IN",
      publisher: {
        "@id": "https://www.aswathypsychologist.com/#person",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://www.aswathypsychologist.com/#person",
      name: "Aswathy Jeyarajasekar",
      jobTitle: "Counselling Psychologist",
      url: "https://www.aswathypsychologist.com",
      image: "https://www.aswathypsychologist.com/aswathy-photo.jpg",
      description:
        "Counselling Psychologist with B.Sc. Psychology and M.Sc. Counselling Psychology with 1+ year in supervised private practice, focusing on client-centred emotional wellbeing.",
      hasCredential: [
        {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "degree",
          name: "M.Sc. in Counselling Psychology",
        },
        {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "degree",
          name: "B.Sc. in Psychology",
        },
      ],
      knowsAbout: [
        "Counselling Psychology",
        "Client-Centred Therapy",
        "Emotional Wellbeing",
        "Stress Management",
        "Young Adult Counselling",
        "Student Mental Health",
        "Interpersonal Dynamics",
      ],
      sameAs: [
        "https://linkedin.com/in/aswathy-jeyarajasekar",
        "https://instagram.com/aswathy.psychology",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": ["ProfessionalService", "HealthAndBeautyBusiness"],
      "@id": "https://www.aswathypsychologist.com/#practice",
      name: "Aswathy Jeyarajasekar Counselling Psychology",
      url: "https://www.aswathypsychologist.com",
      logo: "https://www.aswathypsychologist.com/icon.png",
      image: "https://www.aswathypsychologist.com/aswathy-photo.jpg",
      telephone: "+917550002973",
      email: "roottherapyonline@gmail.com",
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Anna Nagar",
        addressLocality: "Chennai",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 13.085,
        longitude: 80.2101,
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
      founder: {
        "@id": "https://www.aswathypsychologist.com/#person",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          opens: "09:00",
          closes: "18:00",
        },
      ],
    },
  ];

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${plusJakarta.variable} scroll-smooth`}
    >
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HP5856ZKLH"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HP5856ZKLH');
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <JsonLd data={globalSchemas} />
      </head>
      <body className="bg-surface font-body-md text-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
        {children}
      </body>
    </html>
  );
}
