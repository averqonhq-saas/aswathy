import React from "react";

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Renders an inline JSON-LD script for search engine crawlers.
 * Sanitizes unsafe closing script tags to prevent XSS.
 */
export default function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
