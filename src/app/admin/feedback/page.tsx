"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Quote,
  Sparkles,
  CheckCircle2,
  User,
  Shield,
  Calendar,
} from "lucide-react";
import Drawer from "@/components/admin/Drawer";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { ClientFeedback } from "@/lib/db";

export default function AdminFeedbackPage() {
  const { success, error } = useToast();
  const [feedbackList, setFeedbackList] = useState<ClientFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<ClientFeedback | null>(null);
  const [formData, setFormData] = useState({
    clientDisplayName: "",
    feedback: "",
    rating: 5,
    date: new Date().toISOString().split("T")[0],
    isAnonymous: false,
    publicVisibility: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deletingFeedback, setDeletingFeedback] = useState<ClientFeedback | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load reviews
  const loadFeedback = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/feedback");
      if (!res.ok) throw new Error("Failed to load feedback");
      const data = await res.json();
      setFeedbackList(data.feedback || []);
    } catch (err: any) {
      error(err.message || "Failed to load client feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  // Filtered List
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "visible" && item.publicVisibility) ||
        (visibilityFilter === "hidden" && !item.publicVisibility);

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.clientDisplayName.toLowerCase().includes(q) ||
        item.feedback.toLowerCase().includes(q);

      return matchesVisibility && matchesSearch;
    });
  }, [feedbackList, visibilityFilter, searchQuery]);

  // Rating stats
  const stats = useMemo(() => {
    if (feedbackList.length === 0) return { avg: "0.0", count: 0, publicCount: 0 };
    const total = feedbackList.reduce((acc, f) => acc + (f.rating || 5), 0);
    const avg = (total / feedbackList.length).toFixed(1);
    const publicCount = feedbackList.filter((f) => f.publicVisibility).length;
    return { avg, count: feedbackList.length, publicCount };
  }, [feedbackList]);

  // Open for Add
  const handleAddNew = () => {
    setEditingFeedback(null);
    setFormData({
      clientDisplayName: "",
      feedback: "",
      rating: 5,
      date: new Date().toISOString().split("T")[0],
      isAnonymous: false,
      publicVisibility: true,
    });
    setIsModalOpen(true);
  };

  // Open for Edit
  const handleEdit = (item: ClientFeedback) => {
    setEditingFeedback(item);
    setFormData({
      clientDisplayName: item.clientDisplayName,
      feedback: item.feedback,
      rating: item.rating,
      date: item.date,
      isAnonymous: item.isAnonymous,
      publicVisibility: item.publicVisibility,
    });
    setIsModalOpen(true);
  };

  // Toggle public visibility
  const handleToggleVisibility = async (item: ClientFeedback) => {
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          publicVisibility: !item.publicVisibility,
        }),
      });
      if (!res.ok) throw new Error("Failed to update visibility");
      success(
        !item.publicVisibility
          ? "Testimonial is now live on the website."
          : "Testimonial hidden from website."
      );
      loadFeedback();
    } catch (err: any) {
      error(err.message || "Failed to update status");
    }
  };

  // Save feedback (Create or Update)
  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.feedback.trim()) {
      error("Feedback reflection text is required.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingFeedback) {
        // PATCH update
        const res = await fetch("/api/admin/feedback", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingFeedback.id,
            ...formData,
            clientDisplayName: formData.isAnonymous
              ? "Anonymous Client"
              : formData.clientDisplayName || "Anonymous Client",
          }),
        });
        if (!res.ok) throw new Error("Failed to update testimonial");
        success("Testimonial updated.");
      } else {
        // POST create
        const res = await fetch("/api/admin/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            clientDisplayName: formData.isAnonymous
              ? "Anonymous Client"
              : formData.clientDisplayName || "Anonymous Client",
          }),
        });
        if (!res.ok) throw new Error("Failed to create testimonial");
        success("Testimonial saved.");
      }

      setIsModalOpen(false);
      loadFeedback();
    } catch (err: any) {
      error(err.message || "Failed to save feedback");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async () => {
    if (!deletingFeedback) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/feedback?id=${deletingFeedback.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete testimonial");
      success("Testimonial removed.");
      setDeletingFeedback(null);
      loadFeedback();
    } catch (err: any) {
      error(err.message || "Failed to delete testimonial");
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
            <span>Client Testimonials & Feedback</span>
            <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-[#1A3828]/10 text-[#1A3828]">
              {stats.publicCount} Live on Website
            </span>
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Review client reflections from therapy sessions and choose what appears on your public site.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#1A3828]/10 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-[#7B7368]">Average Rating</div>
            <div className="font-playfair text-xl font-bold text-[#1A3828]">
              {stats.avg} / 5.0
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#1A3828]/10 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#7B7368]">Published on Site</div>
            <div className="font-playfair text-xl font-bold text-[#1A3828]">
              {stats.publicCount} Testimonials
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#1A3828]/10 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A3828]/5 text-[#1A3828] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#7B7368]">Confidentiality</div>
            <div className="text-xs font-semibold text-[#1A3828] mt-0.5">
              Client Anonymity Respected
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/80 backdrop-blur-sm border border-[#1A3828]/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7B7368] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feedback keywords or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#1A3828]/15 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#1A3828]/15 bg-white text-[#1A3828] focus:border-[#1A3828] focus:outline-none"
          >
            <option value="all">All Feedback</option>
            <option value="visible">Published on Website</option>
            <option value="hidden">Hidden / Private</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards Grid */}
      {isLoading ? (
        <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
          <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-sans text-[#7B7368]">Loading testimonials...</p>
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm">
          <Quote className="w-12 h-12 text-[#1A3828]/20 mx-auto mb-3" />
          <h3 className="font-playfair text-lg font-semibold text-[#1A3828]">No testimonials found</h3>
          <p className="text-xs text-[#7B7368] mt-1">
            There are currently no reviews matching your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 ${
                item.publicVisibility
                  ? "border-[#1A3828]/15"
                  : "border-slate-200 bg-slate-50/50 opacity-75"
              }`}
            >
              {/* Card Top: Stars & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= item.rating
                          ? "fill-[#F4D242] text-[#F4D242]"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleToggleVisibility(item)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 ${
                    item.publicVisibility
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                  }`}
                  title="Click to toggle website visibility"
                >
                  {item.publicVisibility ? (
                    <>
                      <Eye className="w-3 h-3" /> Live
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" /> Hidden
                    </>
                  )}
                </button>
              </div>

              {/* Reflection Text */}
              <div className="flex-1">
                <p className="text-xs text-[#1A3828] leading-relaxed italic font-sans">
                  "{item.feedback}"
                </p>
              </div>

              {/* Card Footer: Author & Actions */}
              <div className="pt-3 border-t border-[#1A3828]/5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-[#1A3828] flex items-center gap-1.5">
                    <span>{item.clientDisplayName}</span>
                    {item.isAnonymous && (
                      <span className="text-[10px] font-normal text-[#7B7368] italic">
                        (Protected)
                      </span>
                    )}
                  </h4>
                  <div className="text-[10px] text-[#7B7368] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-white text-[#1A3828] transition-colors"
                    title="Edit review"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingFeedback(item)}
                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFeedback ? "Edit Testimonial" : "Add Client Testimonial"}
        subtitle="Ensure client confidentiality by using pseudonyms or marking as anonymous."
        maxWidth="md"
      >
        <form onSubmit={handleSaveFeedback} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Client Name or Pseudonym
            </label>
            <input
              type="text"
              placeholder="e.g., Kavitha R. or Priya M."
              disabled={formData.isAnonymous}
              value={formData.isAnonymous ? "Anonymous Client" : formData.clientDisplayName}
              onChange={(e) =>
                setFormData({ ...formData, clientDisplayName: e.target.value })
              }
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isAnonymous: e.target.checked,
                  clientDisplayName: e.target.checked ? "Anonymous Client" : "",
                })
              }
              className="w-4 h-4 rounded text-[#1A3828] focus:ring-[#1A3828]"
            />
            <label htmlFor="isAnonymous" className="text-xs font-semibold text-[#1A3828] cursor-pointer">
              Display as "Anonymous Client" (Protects identity)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Rating (1 to 5 Stars)
              </label>
              <select
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: Number(e.target.value) })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans"
              >
                <option value={5}>5 Stars (Exceptional)</option>
                <option value={4}>4 Stars (Very Good)</option>
                <option value={3}>3 Stars (Good)</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Session Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Client Reflection / Review Text *
            </label>
            <textarea
              rows={4}
              required
              placeholder="What the client shared regarding their therapeutic journey..."
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none resize-none font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="publicVisibility"
              checked={formData.publicVisibility}
              onChange={(e) =>
                setFormData({ ...formData, publicVisibility: e.target.checked })
              }
              className="w-4 h-4 rounded text-[#1A3828] focus:ring-[#1A3828]"
            />
            <label htmlFor="publicVisibility" className="text-xs font-semibold text-[#1A3828] cursor-pointer">
              Publish on website testimonials carousel
            </label>
          </div>

          <div className="pt-3 border-t border-[#1A3828]/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] hover:bg-[#142C1F] text-white transition-all disabled:opacity-50 shadow-sm"
            >
              {isSaving ? "Saving..." : editingFeedback ? "Update" : "Save Testimonial"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingFeedback)}
        title="Remove Testimonial"
        message="Are you sure you want to delete this client testimonial? This cannot be undone."
        confirmText="Delete Review"
        isDestructive={true}
        onConfirm={handleDeleteFeedback}
        onClose={() => setDeletingFeedback(null)}
      />
    </div>
  );
}
