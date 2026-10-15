"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  ArrowLeft,
  Tag,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { GalleryEvent, GalleryImageItem } from "@/lib/types";

interface EventDetailClientProps {
  event: GalleryEvent;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Normalize all photos (cover + gallery photos)
  const photos: GalleryImageItem[] = React.useMemo(() => {
    const list: GalleryImageItem[] = [];

    if (event.coverImage) {
      list.push({
        id: "cover_img",
        url: event.coverImage,
        caption: `${event.title} - Cover Photo`,
        credit: event.institution,
      });
    }

    (event.galleryImages || []).forEach((img, idx) => {
      if (typeof img === "string") {
        if (img !== event.coverImage) {
          list.push({
            id: `gimg_${idx}`,
            url: img,
            caption: "",
            credit: "",
          });
        }
      } else if (img && img.url && img.url !== event.coverImage) {
        list.push({
          id: img.id || `gimg_${idx}`,
          url: img.url,
          caption: img.caption || "",
          credit: img.credit || "",
        });
      }
    });

    return list;
  }, [event]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;

      if (e.key === "Escape") {
        setActivePhotoIndex(null);
      } else if (e.key === "ArrowLeft") {
        setActivePhotoIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : photos.length - 1
        );
      } else if (e.key === "ArrowRight") {
        setActivePhotoIndex((prev) =>
          prev !== null && prev < photos.length - 1 ? prev + 1 : 0
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, photos.length]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const shareOnWhatsApp = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(
        `Check out this event by Aswathy Jeyarajasekar, Counselling Psychologist: ${event.title}\n${window.location.href}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  const shareOnLinkedIn = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        "_blank"
      );
    }
  };

  return (
    <article className="pt-32 pb-24 max-w-4xl mx-auto px-gutter-mobile lg:px-gutter-desktop space-y-10 text-left">
      {/* Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-secondary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Events</span>
        </Link>

        {/* Share Button Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface border border-parchment-border hover:bg-surface-container text-primary text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1A3828]" />
                <span className="text-[#1A3828] font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-secondary" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={shareOnWhatsApp}
            className="px-3.5 py-1.5 rounded-full bg-[#E8EFEA] hover:bg-[#D4E4DA] text-[#1A3828] text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            title="Share via WhatsApp"
          >
            WhatsApp
          </button>

          <button
            onClick={shareOnLinkedIn}
            className="px-3.5 py-1.5 rounded-full bg-[#EFE9DE] hover:bg-[#E5DDD0] text-primary text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            title="Share on LinkedIn"
          >
            LinkedIn
          </button>
        </div>
      </div>

      {/* Event Header Information */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3.5 py-1 rounded-full bg-secondary-fixed/50 border border-secondary-fixed text-[#544600] text-xs font-semibold uppercase tracking-wider">
            {event.category}
          </span>
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            {event.role}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight">
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-on-surface-variant font-medium pt-1">
          <span className="text-primary font-bold text-base">
            {event.institution}
          </span>

          {event.eventDate && (
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <Calendar className="w-4 h-4 text-secondary" />
              <span>
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <MapPin className="w-4 h-4 text-secondary" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </header>

      {/* Large Featured Cover Image */}
      <div
        onClick={() => setActivePhotoIndex(0)}
        className="group relative w-full h-72 sm:h-[450px] rounded-3xl sm:rounded-4xl overflow-hidden border border-parchment-border bg-surface-container cursor-pointer shadow-lg"
      >
        <Image
          src={event.coverImage}
          alt={event.title}
          fill
          sizes="(max-width: 1024px) 100vw, 950px"
          priority
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-104"
        />
        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-5 py-2.5 rounded-full bg-black/65 backdrop-blur-xs text-white text-xs font-medium flex items-center gap-2">
            <span>Enlarge Photograph</span>
          </span>
        </div>
      </div>

      {/* Main Narrative Description */}
      <div className="space-y-4 pt-4">
        <h2 className="font-serif text-2xl font-bold text-primary border-b border-surface-container pb-3">
          About the Engagement
        </h2>
        <div className="font-body-md text-base sm:text-lg text-on-surface-variant leading-relaxed space-y-5 whitespace-pre-line">
          {event.description}
        </div>
      </div>

      {/* Topics & Takeaways Tags */}
      {event.topics && event.topics.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
            <Tag className="w-4 h-4 text-secondary" />
            <span>Key Themes &amp; Modalities Explored</span>
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {event.topics.map((topic) => (
              <span
                key={topic}
                className="px-4 py-1.5 rounded-full bg-surface-container-high text-primary text-xs sm:text-sm font-medium border border-parchment-border/70"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Photographs Gallery Grid */}
      {photos.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-surface-container">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary flex items-center gap-2">
                <Layers className="w-5 h-5 text-secondary" />
                <span>Event Gallery</span>
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                Click any photograph to view in fullscreen high-resolution lightbox.
              </p>
            </div>
            <span className="text-xs font-semibold text-secondary px-3 py-1 rounded-full bg-surface-container">
              {photos.length} Photos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => setActivePhotoIndex(idx)}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-parchment-border bg-surface-container cursor-pointer shadow-xs hover:shadow-md transition-all"
              >
                <Image
                  src={img.url}
                  alt={img.caption || `Event photo ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-106"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                  {img.caption && (
                    <span className="text-xs font-medium line-clamp-2">
                      {img.caption}
                    </span>
                  )}
                  {img.credit && (
                    <span className="text-[10px] text-white/70">
                      © {img.credit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Consultation Callout Banner */}
      <section className="p-8 sm:p-10 rounded-4xl bg-tertiary text-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <span className="text-secondary-fixed text-xs font-semibold uppercase tracking-widest block">
            Invite Aswathy to your institution
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-surface">
            Looking to organize a workshop or seminar?
          </h3>
          <p className="text-sm text-surface-bright/80 leading-relaxed">
            Aswathy facilitates customized, experiential sessions for colleges,
            corporates, and community organizations focused on emotional
            resilience and mental wellbeing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <Link
            href="/inquiry"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-secondary-fixed text-[#221B00] font-semibold text-xs tracking-wider uppercase hover:bg-secondary-container transition-all text-center"
          >
            Invite as Speaker
          </Link>
          <Link
            href="/gallery"
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-surface/20 hover:bg-surface/10 text-surface text-xs font-medium tracking-wider uppercase transition-all text-center"
          >
            More Events
          </Link>
        </div>
      </section>

      {/* FULLSCREEN LIGHTBOX */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActivePhotoIndex(null)}
        >
          <div
            className="flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs sm:text-sm font-medium tracking-wide">
              {activePhotoIndex + 1} of {photos.length}
            </span>

            <button
              onClick={() => setActivePhotoIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() =>
                setActivePhotoIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                )
              }
              className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer backdrop-blur-xs"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
              <Image
                src={photos[activePhotoIndex].url}
                alt={photos[activePhotoIndex].caption || "Enlarged event photograph"}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            <button
              onClick={() =>
                setActivePhotoIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                )
              }
              className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer backdrop-blur-xs"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div
            className="text-center text-white/90 max-w-xl mx-auto space-y-1 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {photos[activePhotoIndex].caption && (
              <p className="text-sm sm:text-base font-medium">
                {photos[activePhotoIndex].caption}
              </p>
            )}
            {photos[activePhotoIndex].credit && (
              <p className="text-xs text-white/60">
                Photo courtesy: {photos[activePhotoIndex].credit}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
