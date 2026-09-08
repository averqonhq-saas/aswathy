"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Filter,
  Sparkles,
  Eye,
} from "lucide-react";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import type { MediaItem } from "@/lib/types";

export default function AdminMediaPage() {
  const { success, error } = useToast();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Add Media Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMediaForm, setNewMediaForm] = useState({
    title: "",
    url: "",
    category: "website",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Preview Image Modal
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  // Delete Confirm
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load media
  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to load media");
      const data = await res.json();
      setMediaItems(data.media || []);
    } catch (err: any) {
      error(err.message || "Failed to load media.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  // Filtered Media List
  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(q) ||
        item.filename.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [mediaItems, selectedCategory, searchQuery]);

  // Copy Link
  const handleCopyLink = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    success("Image link copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add new media
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaForm.title.trim() || !newMediaForm.url.trim()) {
      error("Title and valid image URL are required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMediaForm),
      });
      if (!res.ok) throw new Error("Failed to add image");
      success("New image added to media library.");
      setIsAddModalOpen(false);
      setNewMediaForm({ title: "", url: "", category: "website" });
      loadMedia();
    } catch (err: any) {
      error(err.message || "Failed to save media.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete media
  const handleDeleteMedia = async () => {
    if (!deletingMedia) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/media?id=${deletingMedia.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove image");
      success("Asset removed from library.");
      setDeletingMedia(null);
      loadMedia();
    } catch (err: any) {
      error(err.message || "Failed to delete asset.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
            <span>Media & Asset Library</span>
            <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-[#1A3828]/10 text-[#1A3828]">
              {mediaItems.length} Assets
            </span>
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Store and organize photography, therapy room images, and graphics for your website and services.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Media Asset</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm border border-[#1A3828]/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7B7368] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media by title or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#1A3828]/15 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#1A3828]/15 bg-white text-[#1A3828] focus:border-[#1A3828] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="profile">Profile & Portrait</option>
            <option value="services">Service Offerings</option>
            <option value="website">Website Backgrounds & Sanctuary</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
          <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-sans text-[#7B7368]">Loading visual assets...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm">
          <ImageIcon className="w-12 h-12 text-[#1A3828]/20 mx-auto mb-3" />
          <h3 className="font-playfair text-lg font-semibold text-[#1A3828]">No media assets found</h3>
          <p className="text-xs text-[#7B7368] mt-1">
            Upload or register image links to use them in your clinical service cards and website pages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#1A3828]/10 hover:border-[#1A3828]/25 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Thumbnail */}
              <div
                onClick={() => setPreviewMedia(item)}
                className="relative h-44 w-full bg-slate-100 cursor-pointer overflow-hidden"
              >
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-[#1A3828] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </span>
                </div>

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-[#1A3828] uppercase tracking-wider shadow-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-[#1A3828] truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-[#7B7368] truncate mt-0.5 font-mono">
                    {item.filename}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1A3828]/5 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyLink(item)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828] transition-colors flex items-center gap-1.5"
                    title="Copy URL to clipboard"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#1A3828]/70" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setDeletingMedia(item)}
                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MEDIA MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Image Asset"
        subtitle="Link any hosted or high-resolution photography asset to your practice library."
        maxWidth="md"
      >
        <form onSubmit={handleAddMedia} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Asset Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Therapy Room Corner, Aswathy Studio Portrait"
              value={newMediaForm.title}
              onChange={(e) =>
                setNewMediaForm({ ...newMediaForm, title: e.target.value })
              }
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Category
            </label>
            <select
              value={newMediaForm.category}
              onChange={(e) =>
                setNewMediaForm({ ...newMediaForm, category: e.target.value })
              }
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans"
            >
              <option value="profile">Profile & Practitioner</option>
              <option value="services">Service Offering</option>
              <option value="website">Website Backgrounds & Sanctuary Room</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Direct Image URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/... or hosted URL"
              value={newMediaForm.url}
              onChange={(e) =>
                setNewMediaForm({ ...newMediaForm, url: e.target.value })
              }
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
            />
          </div>

          {newMediaForm.url && (
            <div className="relative h-36 w-full rounded-xl overflow-hidden border border-[#1A3828]/10 bg-slate-50">
              <Image
                src={newMediaForm.url}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="pt-3 border-t border-[#1A3828]/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] hover:bg-[#142C1F] text-white transition-all disabled:opacity-50 shadow-sm"
            >
              {isSaving ? "Saving..." : "Add to Library"}
            </button>
          </div>
        </form>
      </Modal>

      {/* FULL PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
        title={previewMedia?.title || "Image Preview"}
        subtitle={`Category: ${previewMedia?.category} • ${previewMedia?.filename}`}
        maxWidth="2xl"
      >
        {previewMedia && (
          <div className="space-y-4">
            <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-slate-100 border border-[#1A3828]/10">
              <Image
                src={previewMedia.url}
                alt={previewMedia.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="bg-[#FCF9F2] p-3 rounded-xl border border-[#1A3828]/10 flex items-center justify-between gap-3">
              <span className="text-xs text-[#1A3828] font-mono truncate">
                {previewMedia.url}
              </span>
              <button
                onClick={() => handleCopyLink(previewMedia)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1A3828] text-white hover:bg-[#142C1F] transition-colors shrink-0"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingMedia)}
        title="Remove Asset"
        message={`Are you sure you want to remove "${deletingMedia?.title}"? Any pages using this link may not display the image.`}
        confirmText="Remove Image"
        isDestructive={true}
        onConfirm={handleDeleteMedia}
        onClose={() => setDeletingMedia(null)}
      />
    </div>
  );
}
