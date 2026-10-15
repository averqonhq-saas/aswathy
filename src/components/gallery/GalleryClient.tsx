"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GalleryHero from "./GalleryHero";
import GalleryFilters from "./GalleryFilters";
import GalleryCard from "./GalleryCard";
import GalleryModal from "./GalleryModal";
import type { GalleryEvent } from "@/lib/types";
import { Layers, RefreshCw, Sparkles, Inbox } from "lucide-react";

interface GalleryClientProps {
  initialEvents: GalleryEvent[];
}

const ITEMS_PER_PAGE = 6;

export default function GalleryClient({ initialEvents }: GalleryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // All published events
  const [events, setEvents] = useState<GalleryEvent[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // Pagination / Load More
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Selected event for modal view
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch latest published events dynamically from API on mount
  useEffect(() => {
    async function fetchDynamicEvents() {
      try {
        const res = await fetch("/api/gallery", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.events)) {
            setEvents(data.events);
          }
        }
      } catch (err) {
        console.warn("Could not fetch fresh gallery events:", err);
      }
    }
    fetchDynamicEvents();
  }, []);

  // Sync opened event with ?event=slug in URL
  useEffect(() => {
    const eventSlug = searchParams.get("event");
    if (eventSlug && events.length > 0) {
      const matched = events.find(
        (e) => e.slug.toLowerCase() === eventSlug.toLowerCase()
      );
      if (matched) {
        setSelectedEvent(matched);
      }
    }
  }, [searchParams, events]);

  // Handle open modal and update URL
  const handleOpenEventModal = (event: GalleryEvent) => {
    setSelectedEvent(event);
    const params = new URLSearchParams(window.location.search);
    params.set("event", event.slug);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  // Handle close modal and clear URL param
  const handleCloseEventModal = () => {
    setSelectedEvent(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("event");
    const newQuery = params.toString();
    window.history.replaceState(
      null,
      "",
      newQuery ? `?${newQuery}` : window.location.pathname
    );
  };

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter Category
    if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
      result = result.filter(
        (e) => e.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search Query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.institution.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.shortDescription.toLowerCase().includes(q) ||
          e.topics.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = a.eventDate
        ? new Date(a.eventDate).getTime()
        : new Date(a.createdAt).getTime();
      const dateB = b.eventDate
        ? new Date(b.eventDate).getTime()
        : new Date(b.createdAt).getTime();
      return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [events, selectedCategory, searchQuery, sortBy]);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchQuery, sortBy]);

  const displayedEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleScrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Hero Section */}
      <GalleryHero
        totalPublishedCount={events.length}
        onExploreClick={handleScrollToGrid}
      />

      {/* Main Gallery Content Area */}
      <section
        id="gallery-grid"
        ref={gridRef}
        className="py-16 md:py-24 bg-[#FCF9F2] scroll-mt-24"
      >
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop space-y-12">
          {/* Interactive Filters & Search */}
          <GalleryFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalFilteredCount={filteredEvents.length}
          />

          {/* Cards Grid / Empty State */}
          {isLoading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-surface rounded-3xl overflow-hidden border border-parchment-border/60 animate-pulse space-y-4"
                >
                  <div className="w-full aspect-16/10 bg-surface-container" />
                  <div className="p-6 space-y-3">
                    <div className="w-24 h-4 bg-surface-container rounded-full" />
                    <div className="w-full h-6 bg-surface-container rounded-lg" />
                    <div className="w-4/5 h-4 bg-surface-container rounded-lg" />
                    <div className="w-full h-12 bg-surface-container rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant/50">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary">
                {events.length === 0 ? "No events published yet" : "No matching events found"}
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                {events.length === 0
                  ? "New workshops, guest lectures, and clinical moments will appear here once published."
                  : "We couldn't find any engagements matching your current filters. Try adjusting your search terms or clearing the selected category."}
              </p>
              {events.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-surface font-label-md text-xs font-semibold hover:bg-primary-container transition-all cursor-pointer shadow-xs"
                >
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          ) : (
            /* Published Events Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayedEvents.map((event) => (
                <GalleryCard
                  key={event.id}
                  event={event}
                  onViewEvent={handleOpenEventModal}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-8 text-center">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-primary font-label-md text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span>Load More Moments</span>
                <span className="text-secondary font-bold">
                  ({filteredEvents.length - visibleCount} remaining)
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Event Details View Modal */}
      <GalleryModal event={selectedEvent} onClose={handleCloseEventModal} />
    </>
  );
}
