import { GalleryCategory, GalleryEvent } from "./types";

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Workshops",
  "Guest Lectures",
  "Seminars",
  "Awareness Programmes",
  "Conferences",
  "Other Events",
];

export function generateEventSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `event-${Date.now()}`;
}

export function ensureUniqueSlug(
  desiredSlug: string,
  existingEvents: GalleryEvent[],
  currentEventId?: string
): string {
  let slug = desiredSlug || "event";
  let counter = 1;
  while (
    existingEvents.some(
      (e) => e.slug === slug && (!currentEventId || e.id !== currentEventId)
    )
  ) {
    counter++;
    slug = `${desiredSlug}-${counter}`;
  }
  return slug;
}

export const INITIAL_GALLERY_EVENTS: GalleryEvent[] = [];
