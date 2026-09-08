"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  Calendar,
  Compass,
  CheckCircle2,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import type { JourneyEntry } from "@/lib/types";

export default function AdminContentJourneyPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<JourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load journey entries
  const loadJourney = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/content/journey");
      if (!res.ok) throw new Error("Failed to load journey entries");
      const data = await res.json();
      setItems(data.data || []);
    } catch (err: any) {
      error(err.message || "Failed to load journey.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJourney();
  }, []);

  // Add new blank milestone
  const handleAddMilestone = () => {
    const newItem: JourneyEntry = {
      id: `jrn_${Date.now()}`,
      year: new Date().getFullYear().toString(),
      heading: "New Career Milestone",
      description: "Briefly explain the growth, research, or clinical practice achieved during this phase...",
      order: items.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems([...items, newItem]);
  };

  // Move up/down
  const moveItem = (index: number, direction: "up" | "down") => {
    const nextIdx = direction === "up" ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= items.length) return;
    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = temp;
    setItems(copy);
  };

  // Update item field
  const updateField = (index: number, field: keyof JourneyEntry, value: string) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: value };
    setItems(copy);
  };

  // Delete item
  const handleDelete = () => {
    if (!deletingId) return;
    setItems(items.filter((i) => i.id !== deletingId));
    setDeletingId(null);
    success("Milestone removed from list. Click 'Publish Changes' to save.");
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/content/journey", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Failed to update journey timeline");
      success("Career journey timeline published successfully.");
      loadJourney();
    } catch (err: any) {
      error(err.message || "Failed to save timeline.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
        <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-sans text-[#7B7368]">Loading journey milestones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
            <span>Clinical Journey Timeline</span>
            <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-[#1A3828]/10 text-[#1A3828]">
              {items.length} Milestones
            </span>
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Curate the key milestones, specialized trainings, and stages of your therapeutic practice shown on your website.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleAddMilestone}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#1A3828]/20 bg-white/80 hover:bg-white text-[#1A3828] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Publish Timeline"}</span>
          </button>
        </div>
      </div>

      {/* Timeline Editor Cards */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#1A3828]/10 shadow-xs hover:border-[#1A3828]/25 p-5 transition-all space-y-4"
          >
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#1A3828]/5">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#1A3828]/10 text-[#1A3828] text-xs font-bold flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="font-playfair font-semibold text-sm text-[#1A3828]">
                  Milestone Stage
                </span>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveItem(idx, "up")}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/5 text-[#1A3828] disabled:opacity-30"
                  title="Move Up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, "down")}
                  disabled={idx === items.length - 1}
                  className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/5 text-[#1A3828] disabled:opacity-30"
                  title="Move Down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(item.id)}
                  className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors ml-1"
                  title="Delete Milestone"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Time Period / Year *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2021 or 2023 - Present"
                  value={item.year}
                  onChange={(e) => updateField(idx, "year", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans font-semibold text-[#1A3828]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Stage Heading *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master's in Counselling & Clinical Supervisions"
                  value={item.heading}
                  onChange={(e) => updateField(idx, "heading", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans font-semibold text-[#1A3828]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Milestone Narrative & Insights
              </label>
              <textarea
                rows={3}
                placeholder="Describe your learnings, practical exposure, and how this shaped your therapeutic perspective..."
                value={item.description}
                onChange={(e) => updateField(idx, "description", e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans leading-relaxed resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Remove Milestone"
        message="Are you sure you want to delete this journey entry? Remember to click 'Publish Timeline' to save changes."
        confirmText="Remove Entry"
        isDestructive={true}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
