"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  CheckCircle2,
  XCircle,
  Heart,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { ClientType } from "@/lib/db";

export default function AdminContentClientTypesPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<ClientType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load client types
  const loadClientTypes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/content/client-types");
      if (!res.ok) throw new Error("Failed to load client demographics");
      const data = await res.json();
      setItems(data.data || []);
    } catch (err: any) {
      error(err.message || "Failed to load demographic groups.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClientTypes();
  }, []);

  // Add Item
  const handleAddItem = () => {
    const newItem: ClientType = {
      id: `ct_${Date.now()}`,
      title: "New Client Group / Focus Area",
      description: "Describe the specific life challenges, psychological support, and modalities tailored for this group...",
      isActive: true,
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
    copy.forEach((it, idx) => {
      it.order = idx + 1;
    });
    setItems(copy);
  };

  // Update field
  const updateField = (index: number, field: keyof ClientType, value: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: value };
    setItems(copy);
  };

  // Delete
  const handleDelete = () => {
    if (!deletingId) return;
    const filtered = items.filter((i) => i.id !== deletingId);
    filtered.forEach((it, idx) => {
      it.order = idx + 1;
    });
    setItems(filtered);
    setDeletingId(null);
    success("Focus group removed. Click 'Publish Changes' to persist.");
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/content/client-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Failed to update focus areas");
      success("Client focus areas updated successfully.");
      loadClientTypes();
    } catch (err: any) {
      error(err.message || "Failed to save focus areas.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
        <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-sans text-[#7B7368]">Loading client demographics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
            <span>Who I Work With (Focus Areas)</span>
            <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-[#1A3828]/10 text-[#1A3828]">
              {items.length} Groups
            </span>
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Present the demographic populations, concerns, and psychological themes you specialize in supporting.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleAddItem}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#1A3828]/20 bg-white/80 hover:bg-white text-[#1A3828] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Focus Area</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Publish Changes"}</span>
          </button>
        </div>
      </div>

      {/* Focus Areas List */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border shadow-xs hover:border-[#1A3828]/25 p-5 transition-all space-y-4 ${
              item.isActive ? "border-[#1A3828]/10" : "border-slate-200 opacity-60 bg-slate-50/50"
            }`}
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#1A3828]/5">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#1A3828]/10 text-[#1A3828] text-xs font-bold flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="font-playfair font-semibold text-sm text-[#1A3828]">
                  Focus Area #{idx + 1}
                </span>
              </div>

              {/* Status & Reorder */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateField(idx, "isActive", !item.isActive)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 ${
                    item.isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {item.isActive ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" /> Hidden
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1 border-l border-[#1A3828]/10 pl-2">
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
                    title="Delete Focus Area"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Client Group / Concern Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Young Adults, Corporate Burnout, Relationship Stress"
                value={item.title}
                onChange={(e) => updateField(idx, "title", e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans font-semibold text-[#1A3828]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Context & Support Details
              </label>
              <textarea
                rows={3}
                placeholder="What challenges are common to this community, and how does your therapy help them heal..."
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
        title="Remove Focus Area"
        message="Are you sure you want to delete this focus group? Click 'Publish Changes' to persist."
        confirmText="Remove Group"
        isDestructive={true}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
