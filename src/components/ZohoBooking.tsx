"use client";

import { useEffect, useRef, useState, useId } from "react";
import { ShieldCheck, Calendar, ExternalLink } from "lucide-react";

declare global {
  interface Window {
    Bookings?: {
      inlineEmbed: (config: {
        url: string;
        parent: string | HTMLElement;
        height?: string;
      }) => void;
    };
  }
}

interface ZohoBookingProps {
  height?: string;
  className?: string;
  containerId?: string;
}

export default function ZohoBooking({
  height = "680px",
  className = "",
  containerId,
}: ZohoBookingProps) {
  const autoId = useId().replace(/:/g, "_");
  const targetId = containerId || "inline-container";
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const embedUrl = "https://averqon.zohobookings.in/portal-embed#/averqon";

    const runEmbed = () => {
      const el = containerRef.current || document.getElementById(targetId);
      if (
        typeof window !== "undefined" &&
        window.Bookings &&
        typeof window.Bookings.inlineEmbed === "function" &&
        el
      ) {
        // Clear previous content if any to prevent duplicate frames
        el.innerHTML = "";
        window.Bookings.inlineEmbed({
          url: embedUrl,
          parent: el,
          height: height,
        });
        setHasInitialized(true);
      }
    };

    // Check if script is already loaded on window
    if (typeof window !== "undefined" && window.Bookings) {
      runEmbed();
      return;
    }

    const scriptSrc = "https://bookings.nimbuspop.com/assets/embed.js";
    let scriptTag = document.querySelector(
      `script[src="${scriptSrc}"]`
    ) as HTMLScriptElement | null;

    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.src = scriptSrc;
      scriptTag.async = true;
      scriptTag.onload = () => {
        runEmbed();
      };
      scriptTag.onerror = () => {
        console.warn("Zoho embed script failed to load, falling back to direct iframe.");
      };
      document.body.appendChild(scriptTag);
    } else {
      scriptTag.addEventListener("load", () => {
        runEmbed();
      });
      // If already loaded before listener
      if (window.Bookings) {
        runEmbed();
      }
    }

    // Listen for any postMessage events from Zoho Bookings iframe
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (
          data.action === "booking_completed" ||
          data.type === "booking_success" ||
          data.event === "appointment_booked" ||
          (data.source === "zoho_bookings" && data.booking_id)
        ) {
          fetch("/api/webhooks/zoho", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }).catch((err) => console.warn("Zoho postMessage sync error:", err));
        }
      } catch {
        // Non-JSON or irrelevant postMessage
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [height, targetId]);

  return (
    <div
      className={`w-full rounded-2xl bg-surface border border-parchment-border/80 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {/* Reassuring Secure Header */}
      <div className="px-space-md sm:px-space-lg py-space-sm border-b border-surface-container-high bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs text-body-sm">
        <div className="flex items-center gap-space-xs text-primary font-medium">
          <Calendar className="w-4 h-4 text-secondary shrink-0" />
          <span className="font-headline-sm text-sm">
            Live Consultation Scheduling Sanctuary
          </span>
        </div>
        <div className="flex items-center gap-space-sm text-[12px] text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
            <span>Encrypted Zoho Healthcare Schedule</span>
          </span>
          <a
            href="https://averqon.zohobookings.in/portal-embed#/averqon"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:text-secondary underline font-medium transition-colors"
          >
            <span>Direct Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Target Container where Zoho mounts the embed */}
      <div className="relative w-full bg-surface" style={{ minHeight: height }}>
        {/* Dedicated target element for Bookings.inlineEmbed */}
        <div
          id={targetId}
          ref={containerRef}
          className="w-full flex justify-center [&>iframe]:w-full [&>iframe]:border-0 [&>iframe]:rounded-b-2xl"
          style={{ minHeight: height }}
        />

        {/* Fallback iframe in case script is pending or blocked by privacy extensions */}
        {!hasInitialized && (
          <iframe
            src="https://averqon.zohobookings.in/portal-embed#/averqon"
            title="Aswathy Jeyarajasekar Zoho Bookings"
            className="w-full border-0 rounded-b-2xl absolute inset-0"
            style={{ minHeight: height, height: height }}
            allow="camera; microphone; payment; autoplay"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
