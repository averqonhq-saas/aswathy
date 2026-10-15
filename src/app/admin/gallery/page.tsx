"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Upload,
  Calendar,
  MapPin,
  Tag,
  Link as LinkIcon,
  X,
  ArrowUp,
  ArrowDown,
  Layers,
  Star,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";
import Drawer from "@/components/admin/Drawer";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import type { GalleryEvent, GalleryImageItem, GalleryCategory } from "@/lib/types";
import { GALLERY_CATEGORIES, generateEventSlug } from "@/lib/gallery-data";

export default function AdminGalleryPage() {
  const { success, error } = useToast();
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Create / Edit Drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GalleryEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    category: GalleryCategory | string;
    role: string;
    institution: string;
    shortDescription: string;
    description: string;
    eventDate: string;
    location: string;
    topics: string[];
    coverImage: string;
    galleryImages: GalleryImageItem[];
    isFeatured: boolean;
    status: "draft" | "published";
  }>({
    title: "",
    slug: "",
    category: "Workshops",
    role: "Workshop Facilitator",
    institution: "",
    shortDescription: "",
    description: "",
    eventDate: "",
    location: "",
    topics: [],
    coverImage: "",
    galleryImages: [],
    isFeatured: false,
    status: "published",
  });

  // Topic input state
  const [topicInput, setTopicInput] = useState("");

  // Uploading state
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Direct URL addition for gallery image
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  // Preview Modal state
  const [previewEvent, setPreviewEvent] = useState<GalleryEvent | null>(null);

  // Delete Confirm Dialog state
  const [deletingEvent, setDeletingEvent] = useState<GalleryEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load events
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/gallery");
      if (!res.ok) throw new Error("Failed to load gallery events.");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: any) {
      error(err.message || "Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filtered & Searched Events
  const filteredEvents = useMemo(() => {
    return events.filter((item) => {
      const matchCat =
        selectedCategory === "all" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchStatus =
        selectedStatus === "all" || item.status === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.institution.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.topics.some((t) => t.toLowerCase().includes(q));

      return matchCat && matchStatus && matchQuery;
    });
  }, [events, selectedCategory, selectedStatus, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.status === "published").length;
    const drafts = events.filter((e) => e.status === "draft").length;
    const featured = events.filter((e) => e.isFeatured).length;
    return { total, published, drafts, featured };
  }, [events]);

  // Open Editor for Creating
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      slug: "",
      category: "Workshops",
      role: "Workshop Facilitator",
      institution: "",
      shortDescription: "",
      description: "",
      eventDate: new Date().toISOString().split("T")[0],
      location: "Chennai, Tamil Nadu",
      topics: ["Mental Health", "Resilience"],
      coverImage: "",
      galleryImages: [],
      isFeatured: false,
      status: "published",
    });
    setTopicInput("");
    setIsEditorOpen(true);
  };

  // Open Editor for Editing
  const handleOpenEdit = (event: GalleryEvent) => {
    setEditingEvent(event);
    const normalizedGalleryImages: GalleryImageItem[] = (
      event.galleryImages || []
    ).map((img, idx) => {
      if (typeof img === "string") {
        return {
          id: `img_${idx}`,
          url: img,
          caption: "",
          credit: "",
        };
      }
      return {
        id: img.id || `img_${idx}`,
        url: img.url,
        caption: img.caption || "",
        credit: img.credit || "",
      };
    });

    setFormData({
      title: event.title,
      slug: event.slug,
      category: event.category,
      role: event.role,
      institution: event.institution,
      shortDescription: event.shortDescription,
      description: event.description,
      eventDate: event.eventDate || "",
      location: event.location || "",
      topics: event.topics || [],
      coverImage: event.coverImage,
      galleryImages: normalizedGalleryImages,
      isFeatured: event.isFeatured,
      status: event.status,
    });
    setTopicInput("");
    setIsEditorOpen(true);
  };

  // Quick Toggle Published / Draft
  const handleToggleStatus = async (event: GalleryEvent) => {
    const newStatus = event.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      success(
        `Event "${event.title}" is now ${
          newStatus === "published" ? "Published" : "a Draft"
        }.`
      );
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e))
      );
    } catch (err: any) {
      error(err.message || "Failed to update status");
    }
  };

  // Quick Toggle Featured
  const handleToggleFeatured = async (event: GalleryEvent) => {
    const newFeatured = !event.isFeatured;
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          isFeatured: newFeatured,
        }),
      });
      if (!res.ok) throw new Error("Failed to update featured status");
      success(
        `Event "${event.title}" ${
          newFeatured ? "marked as featured" : "removed from featured"
        }.`
      );
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, isFeatured: newFeatured } : e
        )
      );
    } catch (err: any) {
      error(err.message || "Failed to update featured flag");
    }
  };

  // Add Topic tag
  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (!formData.topics.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        topics: [...prev.topics, trimmed],
      }));
    }
    setTopicInput("");
  };

  // Remove Topic tag
  const handleRemoveTopic = (topicToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t !== topicToRemove),
    }));
  };

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      error("Image size exceeds 10MB limit.");
      return;
    }

    setIsUploadingCover(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFormData((prev) => ({ ...prev, coverImage: data.url }));
      success("Cover image uploaded successfully!");
    } catch (err: any) {
      error(err.message || "Failed to upload cover image.");
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  // Handle Gallery Images Upload (Multiple)
  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    let uploadedCount = 0;

    try {
      const newItems: GalleryImageItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          error(`"${file.name}" exceeds 10MB limit and was skipped.`);
          continue;
        }

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const res = await fetch("/api/admin/gallery/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          uploadedCount++;
          newItems.push({
            id: `gimg_${Date.now()}_${i}`,
            url: data.url,
            caption: "",
            credit: "",
          });
        }
      }

      if (newItems.length > 0) {
        setFormData((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...newItems],
        }));
        success(`${uploadedCount} photograph(s) uploaded successfully!`);
      }
    } catch (err: any) {
      error(err.message || "Gallery upload failed.");
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  // Add Gallery Image by direct URL
  const handleAddGalleryUrl = () => {
    const trimmed = galleryUrlInput.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      galleryImages: [
        ...prev.galleryImages,
        {
          id: `gimg_${Date.now()}`,
          url: trimmed,
          caption: "",
          credit: "",
        },
      ],
    }));
    setGalleryUrlInput("");
  };

  // Reorder gallery photographs
  const handleMoveGalleryPhoto = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const copy = [...prev.galleryImages];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, galleryImages: copy };
    });
  };

  // Remove gallery photo
  const handleRemoveGalleryPhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, idx) => idx !== index),
    }));
  };

  // Update caption or credit of gallery photo
  const handleUpdateGalleryPhotoMeta = (
    index: number,
    field: "caption" | "credit",
    value: string
  ) => {
    setFormData((prev) => {
      const copy = [...prev.galleryImages];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, galleryImages: copy };
    });
  };

  // Save Event (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      error("Event title is required.");
      return;
    }
    if (!formData.category.trim()) {
      error("Event category is required.");
      return;
    }
    if (!formData.role.trim()) {
      error("Professional role is required.");
      return;
    }
    if (!formData.institution.trim()) {
      error("Institution / Organization is required.");
      return;
    }
    if (!formData.shortDescription.trim()) {
      error("Short description is required for event cards.");
      return;
    }
    if (!formData.description.trim()) {
      error("Full event description is required.");
      return;
    }
    if (!formData.coverImage.trim()) {
      error("Please upload or provide a cover image.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        slug: formData.slug.trim() || generateEventSlug(formData.title),
      };

      if (editingEvent) {
        // Update
        const res = await fetch("/api/admin/gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingEvent.id, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update event");
        success(`Event "${formData.title}" updated successfully.`);
      } else {
        // Create
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create event");
        success(`New event "${formData.title}" created successfully.`);
      }

      setIsEditorOpen(false);
      loadEvents();
    } catch (err: any) {
      error(err.message || "Failed to save gallery event.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete event confirmation
  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/gallery?id=${deletingEvent.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete event");
      success(`Event "${deletingEvent.title}" removed.`);
      setDeletingEvent(null);
      loadEvents();
    } catch (err: any) {
      error(err.message || "Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Banner / Hero */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-parchment-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed shadow-xs" />
            <span className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
              Events & Community Portfolio
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl lg:text-3xl text-primary font-serif font-bold mt-1">
            Gallery & Engagements
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-2xl mt-1">
            Manage workshops, guest lectures, seminars, and academic engagements.
            Published events instantly appear on the public Gallery page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-primary font-label-md text-xs font-medium transition-colors shadow-xs"
          >
            <span>Live Gallery</span>
            <ExternalLink className="w-3.5 h-3.5 text-secondary" />
          </a>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-surface hover:bg-primary-container transition-all shadow-md font-label-md text-xs font-semibold cursor-pointer group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-parchment-border/60 shadow-xs">
          <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant block">
            Total Events
          </span>
          <span className="font-serif text-3xl font-bold text-primary mt-1 block">
            {stats.total}
          </span>
          <span className="text-[11px] text-on-surface-variant/70 mt-1 block">
            Across all categories
          </span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-parchment-border/60 shadow-xs">
          <span className="font-label-caps text-[11px] uppercase tracking-wider text-[#2D523E] block">
            Published Live
          </span>
          <span className="font-serif text-3xl font-bold text-[#2D523E] mt-1 block">
            {stats.published}
          </span>
          <span className="text-[11px] text-on-surface-variant/70 mt-1 block">
            Visible to public visitors
          </span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-parchment-border/60 shadow-xs">
          <span className="font-label-caps text-[11px] uppercase tracking-wider text-[#8D6B00] block">
            Drafts
          </span>
          <span className="font-serif text-3xl font-bold text-[#8D6B00] mt-1 block">
            {stats.drafts}
          </span>
          <span className="text-[11px] text-on-surface-variant/70 mt-1 block">
            Hidden from public
          </span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-parchment-border/60 shadow-xs">
          <span className="font-label-caps text-[11px] uppercase tracking-wider text-secondary block">
            Featured
          </span>
          <span className="font-serif text-3xl font-bold text-primary mt-1 block">
            {stats.featured}
          </span>
          <span className="text-[11px] text-on-surface-variant/70 mt-1 block">
            Highlighted engagements
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-parchment-border/60 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by event title, institution, role, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-parchment-border bg-surface-container-low text-primary text-xs focus:outline-hidden focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant/60" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-parchment-border bg-surface-container-low text-primary text-xs focus:outline-hidden focus:ring-2 focus:ring-secondary/40 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {GALLERY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-parchment-border bg-surface-container-low text-primary text-xs focus:outline-hidden focus:ring-2 focus:ring-secondary/40 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {(searchQuery ||
            selectedCategory !== "all" ||
            selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
              className="text-xs text-secondary hover:text-primary underline underline-offset-4 cursor-pointer px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Table / Card View */}
      <div className="bg-surface rounded-2xl border border-parchment-border/60 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <RefreshCw className="w-6 h-6 animate-spin text-secondary" />
            <p className="font-body-md text-sm">Loading gallery events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/50 mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-headline-sm text-base text-primary font-semibold">
              No events found
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
              {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                ? "Try adjusting your search criteria or resetting the filters."
                : "No gallery events created yet. Add your first engagement to get started."}
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-surface font-label-md text-xs font-semibold hover:bg-primary-container transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container bg-surface-container-low/70 text-[11px] uppercase tracking-wider font-label-caps text-on-surface-variant">
                  <th className="py-3.5 px-4 font-semibold">Event</th>
                  <th className="py-3.5 px-4 font-semibold">Category & Role</th>
                  <th className="py-3.5 px-4 font-semibold">Institution & Date</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Featured</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Photos</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 text-xs">
                {filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-surface-container-lowest/70 transition-colors group"
                  >
                    {/* Cover & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-11 rounded-lg overflow-hidden shrink-0 border border-parchment-border bg-surface-container-high">
                          {event.coverImage ? (
                            <Image
                              src={event.coverImage}
                              alt={event.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <span className="font-semibold text-primary block text-sm line-clamp-1 group-hover:text-secondary transition-colors">
                            {event.title}
                          </span>
                          <span className="text-[11px] text-on-surface-variant font-mono block">
                            /{event.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Role */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-secondary-fixed/50 text-[#544600] border border-secondary-fixed">
                        {event.category}
                      </span>
                      <span className="block text-[11px] text-on-surface-variant mt-1 font-medium">
                        {event.role}
                      </span>
                    </td>

                    {/* Institution & Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-primary block line-clamp-1">
                        {event.institution}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant/80 mt-0.5">
                        <Calendar className="w-3 h-3 text-secondary" />
                        <span>
                          {event.eventDate
                            ? new Date(event.eventDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "Date not set"}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge & Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(event)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-all border ${
                          event.status === "published"
                            ? "bg-[#E8EFEA] text-[#1A3828] border-[#A2C7AF] hover:bg-[#D4E4DA]"
                            : "bg-[#FEF7E0] text-[#735F00] border-[#E8D080] hover:bg-[#FCE8A6]"
                        }`}
                        title="Click to toggle status"
                      >
                        {event.status === "published" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#1A3828]" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-[#735F00]" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(event)}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          event.isFeatured
                            ? "text-[#F4D242] bg-[#3A261B] hover:bg-tertiary"
                            : "text-on-surface-variant/40 hover:text-secondary hover:bg-surface-container"
                        }`}
                        title={
                          event.isFeatured
                            ? "Featured on highlights (click to unfeature)"
                            : "Not featured (click to feature)"
                        }
                      >
                        <Star
                          className={`w-4 h-4 ${
                            event.isFeatured ? "fill-[#F4D242]" : ""
                          }`}
                        />
                      </button>
                    </td>

                    {/* Photo count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[11px] font-medium">
                        <ImageIcon className="w-3 h-3 text-secondary" />
                        <span>{event.galleryImages?.length || 0}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewEvent(event)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                          title="Preview Event"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(event)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingEvent(event)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/40 transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT DRAWER */}
      <Drawer
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingEvent ? "Edit Gallery Event" : "Create New Gallery Event"}
        subtitle="Manage professional details, cover photo, topics, and gallery photos."
        width="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-full border border-parchment-border bg-surface hover:bg-surface-container text-on-surface-variant text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={isSaving || isUploadingCover || isUploadingGallery}
              className="px-6 py-2 rounded-full bg-primary hover:bg-primary-container text-surface text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>
                {editingEvent ? "Save Changes" : "Create & Publish Event"}
              </span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-6 text-xs">
          {/* Status & Featured Toggles */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-parchment-border/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="font-semibold text-primary">Publication Status:</label>
              <div className="flex items-center bg-surface rounded-full p-0.5 border border-parchment-border">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, status: "draft" }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    formData.status === "draft"
                      ? "bg-secondary-fixed text-[#544600] font-semibold"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, status: "published" }))
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    formData.status === "published"
                      ? "bg-[#2D523E] text-white font-semibold"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Published
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, isFeatured: e.target.checked }))
                }
                className="w-4 h-4 rounded text-primary focus:ring-secondary cursor-pointer"
              />
              <span className="font-medium text-primary flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                Featured Highlight
              </span>
            </label>
          </div>

          {/* Title & Slug */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-primary mb-1">
                Event Title <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Navigating Academic Pressure & Emotional Resilience"
                value={formData.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    title: val,
                    slug:
                      !editingEvent || prev.slug === generateEventSlug(prev.title)
                        ? generateEventSlug(val)
                        : prev.slug,
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">
                SEO-Friendly URL Slug <span className="text-[#BA1A1A]">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-surface-container rounded-l-xl border border-r-0 border-parchment-border text-on-surface-variant font-mono text-[11px]">
                  /gallery/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateEventSlug(e.target.value),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-r-xl border border-parchment-border bg-surface text-primary font-mono text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Category, Role, Institution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-primary mb-1">
                Category <span className="text-[#BA1A1A]">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden cursor-pointer"
              >
                {GALLERY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">
                Professional Role <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Workshop Facilitator, Guest Speaker, Keynote"
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">
                Institution or Organization <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stella Maris College, Chennai"
                value={formData.institution}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    institution: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">
                Event Date (Optional)
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, eventDate: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold text-primary mb-1">
              Location / Venue (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Anna University Campus, Chennai or Online Telehealth"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block font-semibold text-primary mb-1">
              Short Description (Card preview) <span className="text-[#BA1A1A]">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Concise 1-2 sentence overview displayed on gallery event cards..."
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  shortDescription: e.target.value,
                }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block font-semibold text-primary mb-1">
              Full Description & Takeaways <span className="text-[#BA1A1A]">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Detailed description of the workshop, learning outcomes, attendee engagement, and insights..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
            />
          </div>

          {/* Topics Covered Tag Builder */}
          <div>
            <label className="block font-semibold text-primary mb-1">
              Topics Covered (Key themes)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Type a topic (e.g. Somatic Grounding) and press Add..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs transition-colors cursor-pointer"
              >
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.topics.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed/40 text-[#544600] border border-secondary-fixed/70 text-[11px] font-medium"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(t)}
                    className="hover:text-[#BA1A1A] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.topics.length === 0 && (
                <span className="text-[11px] text-on-surface-variant/60 italic">
                  No topics added yet.
                </span>
              )}
            </div>
          </div>

          {/* Cover Image Upload & URL */}
          <div className="space-y-3 p-4 rounded-xl border border-parchment-border bg-surface-container-low">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-primary flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-secondary" />
                Cover Image <span className="text-[#BA1A1A]">*</span>
              </label>
              {isUploadingCover && (
                <span className="text-[11px] text-secondary font-medium flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                  Uploading file...
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                ref={coverFileInputRef}
                onChange={handleCoverUpload}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-secondary bg-surface hover:bg-secondary-fixed/20 text-primary font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-secondary" />
                <span>Choose Image File (Max 10MB)</span>
              </button>

              <span className="text-on-surface-variant/60 text-xs">or paste URL:</span>

              <input
                type="url"
                placeholder="https://..."
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                }
                className="flex-1 w-full px-3 py-2 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
              />
            </div>

            {formData.coverImage && (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-parchment-border mt-2 bg-surface">
                <Image
                  src={formData.coverImage}
                  alt="Cover preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, coverImage: "" }))}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Multiple Gallery Photographs */}
          <div className="space-y-4 p-4 rounded-xl border border-parchment-border bg-surface-container-low">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-primary flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-secondary" />
                  Gallery Photographs ({formData.galleryImages.length})
                </h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Upload multiple event photos, reorder them, and add optional
                  captions & credits.
                </p>
              </div>

              {isUploadingGallery && (
                <span className="text-[11px] text-secondary font-medium flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                  Uploading...
                </span>
              )}
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                ref={galleryFileInputRef}
                onChange={handleGalleryUpload}
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                disabled={isUploadingGallery}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-surface hover:bg-surface-container border border-parchment-border text-primary font-medium text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-secondary" />
                <span>Upload Multiple Photos</span>
              </button>

              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Or paste photo URL..."
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGalleryUrl();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-parchment-border bg-surface text-primary text-xs focus:ring-2 focus:ring-secondary/40 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Gallery Images List */}
            {formData.galleryImages.length > 0 && (
              <div className="space-y-3 mt-3">
                {formData.galleryImages.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="p-3 rounded-xl border border-parchment-border/80 bg-surface flex flex-col sm:flex-row items-center gap-3 shadow-2xs"
                  >
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-parchment-border bg-surface-container">
                      <Image
                        src={img.url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        placeholder="Photo Caption (optional)..."
                        value={img.caption || ""}
                        onChange={(e) =>
                          handleUpdateGalleryPhotoMeta(
                            idx,
                            "caption",
                            e.target.value
                          )
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-parchment-border bg-surface-container-low text-primary text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Photo Credit (optional, e.g. College Media Club)..."
                        value={img.credit || ""}
                        onChange={(e) =>
                          handleUpdateGalleryPhotoMeta(
                            idx,
                            "credit",
                            e.target.value
                          )
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-parchment-border bg-surface-container-low text-primary text-xs"
                      />
                    </div>

                    <div className="flex sm:flex-col items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveGalleryPhoto(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveGalleryPhoto(idx, "down")}
                        disabled={idx === formData.galleryImages.length - 1}
                        className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryPhoto(idx)}
                        className="p-1 rounded text-[#BA1A1A] hover:bg-[#FFDAD6]/40 cursor-pointer"
                        title="Remove Photograph"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Drawer>

      {/* EVENT PREVIEW MODAL */}
      {previewEvent && (
        <Modal
          isOpen={Boolean(previewEvent)}
          onClose={() => setPreviewEvent(null)}
          title="Event Preview"
          subtitle={`${previewEvent.category} • ${previewEvent.status.toUpperCase()}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-on-surface-variant">
                Slug: /{previewEvent.slug}
              </span>
              <button
                onClick={() => setPreviewEvent(null)}
                className="px-4 py-2 rounded-full bg-primary text-surface font-semibold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {previewEvent.coverImage && (
              <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-parchment-border">
                <Image
                  src={previewEvent.coverImage}
                  alt={previewEvent.title}
                  fill
                  sizes="600px"
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-xs font-semibold text-primary text-[10px] uppercase tracking-wider">
                  {previewEvent.category}
                </span>
              </div>
            )}

            <div>
              <span className="text-secondary font-semibold uppercase tracking-wider text-[11px] block">
                {previewEvent.role} • {previewEvent.institution}
              </span>
              <h2 className="font-serif text-xl font-bold text-primary mt-1">
                {previewEvent.title}
              </h2>
              {previewEvent.eventDate && (
                <div className="flex items-center gap-1.5 text-on-surface-variant mt-1">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                  <span>
                    {new Date(previewEvent.eventDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                  {previewEvent.location && (
                    <>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                      <span>{previewEvent.location}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-parchment-border/60">
              <span className="font-semibold text-primary block mb-1">
                Short Summary:
              </span>
              <p className="text-on-surface-variant leading-relaxed">
                {previewEvent.shortDescription}
              </p>
            </div>

            <div>
              <span className="font-semibold text-primary block mb-1">
                Full Description:
              </span>
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                {previewEvent.description}
              </p>
            </div>

            {previewEvent.topics?.length > 0 && (
              <div>
                <span className="font-semibold text-primary block mb-1.5">
                  Topics Covered:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewEvent.topics.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full bg-surface-container text-primary text-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {previewEvent.galleryImages?.length > 0 && (
              <div>
                <span className="font-semibold text-primary block mb-2">
                  Photographs ({previewEvent.galleryImages.length}):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {previewEvent.galleryImages.map((img, idx) => {
                    const url = typeof img === "string" ? img : img.url;
                    return (
                      <div
                        key={idx}
                        className="relative h-24 rounded-lg overflow-hidden border border-parchment-border"
                      >
                        <Image
                          src={url}
                          alt="Gallery item"
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingEvent)}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Gallery Event"
        message={`Are you sure you want to permanently delete "${deletingEvent?.title}"? This will remove the event and all associated gallery images from the public website.`}
        confirmLabel="Delete Event"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
