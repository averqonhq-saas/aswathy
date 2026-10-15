"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight, Layers, Star } from "lucide-react";
import type { GalleryEvent } from "@/lib/types";

interface GalleryCardProps {
  event: GalleryEvent;
  onViewEvent: (event: GalleryEvent) => void;
}

export default function GalleryCard({ event, onViewEvent }: GalleryCardProps) {
  const photoCount = event.galleryImages?.length || 0;

  return (
    <article
      onClick={() => onViewEvent(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewEvent(event);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${event.title}`}
      className="group relative bg-surface rounded-3xl overflow-hidden border border-parchment-border/70 hover:border-secondary/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer text-left focus:outline-hidden focus:ring-3 focus:ring-secondary/40 focus:ring-offset-2 focus:ring-offset-surface"
    >
      {/* Cover Image Container */}
      <div className="relative w-full aspect-16/10 overflow-hidden bg-surface-container-high shrink-0">
        <Image
          src={event.coverImage}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
        />

        {/* Subtle Dark Gradient Overlay for Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          {/* Category Badge */}
          <span className="px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md text-[#544600] border border-secondary-fixed text-[11px] font-semibold tracking-wide uppercase shadow-xs">
            {event.category}
          </span>

          {/* Featured or Photo count badge */}
          <div className="flex items-center gap-1.5">
            {event.isFeatured && (
              <span className="px-2.5 py-1 rounded-full bg-[#3A261B]/90 backdrop-blur-md text-[#FFE16D] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-xs">
                <Star className="w-3 h-3 fill-[#FFE16D]" />
                <span>Featured</span>
              </span>
            )}
            {photoCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 shadow-xs">
                <Layers className="w-3 h-3" />
                <span>{photoCount}</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom role & institution on image */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-white pointer-events-none">
          <span className="text-[11px] font-medium tracking-wide uppercase text-secondary-fixed drop-shadow-xs block">
            {event.role}
          </span>
          <span className="text-xs font-semibold text-white/95 line-clamp-1 drop-shadow-xs">
            {event.institution}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Date & Location (only when provided) */}
          {(event.eventDate || event.location) && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              {event.eventDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                  <span>
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {event.eventDate && event.location && (
                <span className="text-on-surface-variant/40">•</span>
              )}
              {event.location && (
                <div className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-secondary shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Event Title */}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-primary group-hover:text-primary-container transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          {/* Short Description */}
          <p className="font-body-md text-body-md text-on-surface-variant text-xs sm:text-sm line-clamp-3 leading-relaxed">
            {event.shortDescription}
          </p>
        </div>

        {/* Footer: Topics & Action */}
        <div className="pt-2 border-t border-surface-container/60 space-y-3">
          {/* Topics Preview (up to 3) */}
          {event.topics && event.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-medium"
                >
                  {topic}
                </span>
              ))}
              {event.topics.length > 3 && (
                <span className="text-[10px] text-on-surface-variant/70 self-center">
                  +{event.topics.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Action Link */}
          <div className="flex items-center justify-between text-xs font-semibold text-primary group-hover:text-secondary transition-colors pt-1">
            <span className="font-label-caps uppercase tracking-wider text-[11px]">
              View Event
            </span>
            <span className="w-7 h-7 rounded-full bg-surface-container group-hover:bg-secondary-fixed flex items-center justify-center text-primary group-hover:text-[#221B00] transition-all duration-200 group-hover:translate-x-1">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
