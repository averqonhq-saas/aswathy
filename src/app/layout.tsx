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

export const metadata: Metadata = {
  title: "Aswathy Jeyarajasekar | Counselling Psychologist",
  description:
    "An empathetic, collaborative space to explore your thoughts, emotions, experiences, and the parts of life that may feel difficult to navigate alone.",
  keywords: [
    "Counselling Psychologist",
    "Psychology",
    "Therapy",
    "Mental Health",
    "Person-centered counselling",
    "Anxiety support",
    "Student counselling",
    "Aswathy Jeyarajasekar",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.aswathypsychologist.com"
  ),
  alternates: {
    canonical: "https://www.aswathypsychologist.com",
  },
  authors: [{ name: "Aswathy Jeyarajasekar" }],
  openGraph: {
    title: "Aswathy Jeyarajasekar | Counselling Psychologist",
    description: "A space to understand yourself, at your own pace.",
    url: "https://www.aswathypsychologist.com",
    type: "website",
    siteName: "Aswathy Jeyarajasekar Therapy",
    images: [
      {
        url: "/aswathy-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Aswathy Jeyarajasekar, Counselling Psychologist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aswathy Jeyarajasekar | Counselling Psychologist",
    description:
      "An empathetic, collaborative space to explore your thoughts, emotions, and life challenges.",
    images: ["/aswathy-photo.jpg"],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      </head>
      <body className="bg-surface font-body-md text-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
        {children}
      </body>
    </html>
  );
}
