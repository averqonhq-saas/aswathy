"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Sparkles,
  Save,
  Plus,
  X,
  Award,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import type { WebsiteAboutContent } from "@/lib/types";

export default function AdminContentAboutPage() {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<WebsiteAboutContent>({
    name: "",
    title: "",
    shortIntro: "",
    fullBio: "",
    experienceYears: "",
    qualifications: [],
    profileImage: "",
    updatedAt: "",
  });

  const [newQualification, setNewQualification] = useState("");

  // Load about content
  const loadAboutContent = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/content/about");
      if (!res.ok) throw new Error("Failed to load about content");
      const data = await res.json();
      if (data.data) {
        setFormData(data.data);
      }
    } catch (err: any) {
      error(err.message || "Failed to load content.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAboutContent();
  }, []);

  // Add qualification tag
  const handleAddQualification = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newQualification.trim();
    if (!trimmed) return;
    if (formData.qualifications.includes(trimmed)) {
      error("This qualification is already listed.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, trimmed],
    }));
    setNewQualification("");
  };

  // Remove qualification tag
  const handleRemoveQualification = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((q) => q !== item),
    }));
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim()) {
      error("Name and title are required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/content/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update profile content");
      success("Psychologist profile & bio successfully updated.");
    } catch (err: any) {
      error(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
        <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-sans text-[#7B7368]">Loading profile content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
            <span>Psychologist Profile & Biography</span>
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Customize your professional bio, experience credentials, and portrait shown to prospective clients.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving Changes..." : "Publish Updates"}</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Basic Identity Card */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4">
            <h3 className="font-playfair text-base font-semibold text-[#1A3828] flex items-center gap-2">
              <User className="w-4 h-4 text-[#1A3828]" />
              <span>Identity & Professional Designation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Full Practitioner Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Years of Experience
                </label>
                <input
                  type="text"
                  placeholder="e.g., 5+ Years"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceYears: e.target.value })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Professional Title / Subtitle *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., M.Sc. Counselling Psychology | Certified Therapist"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Short Elevator Introduction (Displayed prominently in header)
              </label>
              <textarea
                rows={2}
                value={formData.shortIntro}
                onChange={(e) => setFormData({ ...formData, shortIntro: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none resize-none font-sans"
              />
            </div>
          </div>

          {/* Full Narrative Biography Card */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4">
            <h3 className="font-playfair text-base font-semibold text-[#1A3828] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1A3828]" />
              <span>Full Narrative Biography & Approach</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Comprehensive Therapeutic Bio (Supports multi-paragraph text)
              </label>
              <textarea
                rows={8}
                value={formData.fullBio}
                onChange={(e) => setFormData({ ...formData, fullBio: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans leading-relaxed resize-none"
              />
              <p className="text-[11px] text-[#7B7368] mt-1">
                Share your clinical background, philosophy of care, and how you establish a non-judgmental space for your clients.
              </p>
            </div>
          </div>

          {/* Qualifications & Accreditations */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4">
            <h3 className="font-playfair text-base font-semibold text-[#1A3828] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1A3828]" />
              <span>Qualifications & Clinical Certifications</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add degree, license, or specialized training..."
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddQualification();
                  }
                }}
                className="flex-1 text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => handleAddQualification()}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1A3828]/10 hover:bg-[#1A3828]/20 text-[#1A3828] transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.qualifications.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-xl bg-[#FCF9F2] border border-[#1A3828]/15 text-xs text-[#1A3828] font-medium flex items-center gap-2 shadow-xs"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQualification(item)}
                    className="text-[#7B7368] hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>

        {/* Right 1 Col: Photo & Public Preview Card */}
        <div className="space-y-6">
          {/* Profile Photo Editor */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4">
            <h3 className="font-playfair text-base font-semibold text-[#1A3828] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#1A3828]" />
              <span>Portrait Photograph</span>
            </h3>

            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-[#FCF9F2] border border-[#1A3828]/10">
              {formData.profileImage ? (
                <Image
                  src={formData.profileImage}
                  alt={formData.name || "Aswathy"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#7B7368] p-4 text-center">
                  <User className="w-12 h-12 text-[#1A3828]/20 mb-2" />
                  <span className="text-xs">No image provided</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Image Source URL
              </label>
              <input
                type="url"
                value={formData.profileImage}
                onChange={(e) =>
                  setFormData({ ...formData, profileImage: e.target.value })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
              <p className="text-[11px] text-[#7B7368] mt-1">
                You can select or upload images in your <span className="font-semibold text-[#1A3828]">Media Library</span> and paste the link here.
              </p>
            </div>
          </div>

          {/* Quick Preview Card */}
          <div className="bg-[#FCF9F2] rounded-2xl border border-[#1A3828]/15 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B7368]">
                Public Card Preview
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-semibold">
                Live on Home
              </span>
            </div>

            <div>
              <h4 className="font-playfair text-lg font-bold text-[#1A3828]">
                {formData.name || "Aswathy Jeyarajasekar"}
              </h4>
              <p className="text-xs text-[#7B7368] font-medium">{formData.title}</p>
            </div>

            <p className="text-xs text-[#1A3828]/80 line-clamp-3 italic leading-relaxed">
              "{formData.shortIntro}"
            </p>

            <div className="pt-2 border-t border-[#1A3828]/10 flex items-center justify-between text-[11px] text-[#7B7368]">
              <span>Experience:</span>
              <span className="font-bold text-[#1A3828]">{formData.experienceYears}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
