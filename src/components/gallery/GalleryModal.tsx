"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Calendar,
  MapPin,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ExternalLink,
  Tag,
  ArrowLeft,
  Layers,
  Sparkles,
} from "lucide-react";
import type { GalleryEvent, GalleryImageItem } from "@/lib/types";

interface GalleryModalProps {
  event: GalleryEvent | null;
  onClose: () => void;
}

export default function GalleryModal({ event, onClose }: GalleryModalProps) {
  // Lightbox state for clicked photograph
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Normalize gallery images
  const photos: GalleryImageItem[] = React.useMemo(() => {
    if (!event) return [];
    const list: GalleryImageItem[] = [];

    // Include cover image first if not already in gallery
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (event) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [event]);

  // Keyboard navigation for lightbox & closing modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!event) return;

      if (e.key === "Escape") {
        if (activePhotoIndex !== null) {
          setActivePhotoIndex(null);
        } else {
          onClose();
        }
      }

      if (activePhotoIndex !== null) {
        if (e.key === "ArrowLeft") {
          setActivePhotoIndex((prev) =>
            prev !== null && prev > 0 ? prev - 1 : photos.length - 1
          );
        } else if (e.key === "ArrowRight") {
          setActivePhotoIndex((prev) =>
            prev !== null && prev < photos.length - 1 ? prev + 1 : 0
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [event, activePhotoIndex, photos.length, onClose]);

  if (!event) return null;

  // Handle Share link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/gallery/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      {/* Background Dim Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#2A1D17]/60 backdrop-blur-sm transition-opacity animate-fadeIn overflow-y-auto"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div className="min-h-full flex items-center justify-center p-3 sm:p-6 md:p-8">
          <div
            className="relative w-full max-w-4xl bg-surface rounded-3xl sm:rounded-4xl shadow-2xl border border-parchment-border overflow-hidden my-6 animate-scaleUp text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Navigation & Close Bar */}
            <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md px-6 py-4 border-b border-surface-container flex items-center justify-between">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-secondary transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to Gallery</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  title="Share event link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#1A3828]" />
                      <span className="text-[#1A3828]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-secondary" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/gallery/${event.slug}`}
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors cursor-pointer"
                  title="Open Dedicated Event Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 md:p-10 space-y-8 max-h-[calc(90vh-5rem)] overflow-y-auto custom-scrollbar">
              {/* Event Header Banner */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3.5 py-1 rounded-full bg-secondary-fixed/50 border border-secondary-fixed text-[#544600] text-xs font-semibold tracking-wider uppercase">
                    {event.category}
                  </span>
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    {event.role}
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary leading-tight">
                  {event.title}
                </h1>

                {/* Institution & Metadata Pills */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-on-surface-variant font-medium pt-1">
                  <span className="text-primary font-semibold">
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
              </div>

              {/* Cover Image Feature */}
              <div
                onClick={() => setActivePhotoIndex(0)}
                className="group relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden border border-parchment-border bg-surface-container cursor-pointer shadow-md"
              >
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-104"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-medium flex items-center gap-2">
                    <Maximize2 className="w-4 h-4" />
                    <span>View in Lightbox</span>
                  </span>
                </div>
              </div>

              {/* Full Event Description */}
              <div className="space-y-4 pt-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-primary border-b border-surface-container pb-2">
                  Overview &amp; Experience
                </h3>
                <div className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed space-y-4 whitespace-pre-line">
                  {event.description}
                </div>
              </div>

              {/* Topics Covered */}
              {event.topics && event.topics.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                    <Tag className="w-4 h-4 text-secondary" />
                    <span>Topics &amp; Themes Explored</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary text-xs font-medium border border-parchment-border/60"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photographs Gallery Grid */}
              {photos.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-surface-container">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-primary flex items-center gap-2">
                      <Layers className="w-5 h-5 text-secondary" />
                      <span>Event Photographs ({photos.length})</span>
                    </h3>
                    <span className="text-xs text-on-surface-variant font-medium">
                      Click any photo to enlarge
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {photos.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-parchment-border bg-surface-container cursor-pointer shadow-2xs hover:shadow-md transition-all"
                      >
                        <Image
                          src={img.url}
                          alt={img.caption || `Event photo ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-106"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2.5">
                          {img.caption && (
                            <span className="text-[10px] sm:text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1 drop-shadow-xs">
                              {img.caption}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to Gallery Bottom Action */}
              <div className="pt-6 border-t border-surface-container flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-primary font-label-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Back to Gallery
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-surface font-label-md text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "Link Copied!" : "Share Event"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Lightbox Top Bar */}
          <div
            className="flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs sm:text-sm font-medium tracking-wide">
              {activePhotoIndex + 1} / {photos.length}
            </span>

            <button
              onClick={() => setActivePhotoIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Main Image & Prev/Next Controls */}
          <div
            className="relative flex-1 flex items-center justify-center my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
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

            {/* Active Image */}
            <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
              <Image
                src={photos[activePhotoIndex].url}
                alt={photos[activePhotoIndex].caption || "Enlarged event photo"}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {/* Next Button */}
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

          {/* Lightbox Bottom Caption & Credit */}
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
    </>
  );
}
