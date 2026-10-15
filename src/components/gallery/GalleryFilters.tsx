"use client";

import React from "react";
import { Search, X, ArrowUpDown, Filter } from "lucide-react";
import { GALLERY_CATEGORIES } from "@/lib/gallery-data";

interface GalleryFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "newest" | "oldest";
  onSortChange: (sortBy: "newest" | "oldest") => void;
  totalFilteredCount: number;
}

export default function GalleryFilters({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalFilteredCount,
}: GalleryFiltersProps) {
  const categories = ["All", ...GALLERY_CATEGORIES];

  return (
    <div className="space-y-6">
      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by event title, college, or topic..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-full border border-parchment-border bg-surface text-primary text-xs sm:text-sm placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <span className="text-xs text-on-surface-variant/80 font-medium">
            Showing <strong className="text-primary">{totalFilteredCount}</strong>{" "}
            {totalFilteredCount === 1 ? "event" : "events"}
          </span>

          <div className="flex items-center gap-2 bg-surface px-3 py-2 rounded-full border border-parchment-border shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-secondary" />
            <select
              value={sortBy}
              onChange={(e) =>
                onSortChange(e.target.value as "newest" | "oldest")
              }
              className="bg-transparent text-primary text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Category Filter Tabs */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mask-gradient">
          {categories.map((cat) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-surface shadow-md scale-102"
                    : "bg-surface hover:bg-surface-container text-on-surface-variant hover:text-primary border border-parchment-border/70 shadow-2xs"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
