"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ListOrdered,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { SessionStep } from "@/lib/db";

export default function AdminContentSessionPage() {
  const { success, error } = useToast();
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load session steps
  const loadSteps = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/content/session");
      if (!res.ok) throw new Error("Failed to load session expectations");
      const data = await res.json();
      setSteps(data.data || []);
    } catch (err: any) {
      error(err.message || "Failed to load steps.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSteps();
  }, []);

  // Add Step
  const handleAddStep = () => {
    const nextNum = `0${steps.length + 1}`.slice(-2);
    const newStep: SessionStep = {
      id: `step_${Date.now()}`,
      stepNumber: nextNum,
      title: "New Therapy Step",
      description: "Explain what occurs during this phase of the therapeutic engagement...",
      isActive: true,
      order: steps.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSteps([...steps, newStep]);
  };

  // Move up/down
  const moveStep = (index: number, direction: "up" | "down") => {
    const nextIdx = direction === "up" ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= steps.length) return;
    const copy = [...steps];
    const temp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = temp;
    // reassign numbers
    copy.forEach((s, idx) => {
      s.stepNumber = `0${idx + 1}`.slice(-2);
      s.order = idx + 1;
    });
    setSteps(copy);
  };

  // Update field
  const updateField = (index: number, field: keyof SessionStep, value: any) => {
    const copy = [...steps];
    copy[index] = { ...copy[index], [field]: value };
    setSteps(copy);
  };

  // Delete step
  const handleDelete = () => {
    if (!deletingId) return;
    const filtered = steps.filter((s) => s.id !== deletingId);
    filtered.forEach((s, idx) => {
      s.stepNumber = `0${idx + 1}`.slice(-2);
      s.order = idx + 1;
    });
    setSteps(filtered);
    setDeletingId(null);
    success("Step removed. Click 'Publish Updates' to persist changes.");
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/content/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: steps }),
      });
      if (!res.ok) throw new Error("Failed to update session steps");
      success("Therapy process steps published to website.");
      loadSteps();
    } catch (err: any) {
      error(err.message || "Failed to save steps.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
        <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-sans text-[#7B7368]">Loading expectation steps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
            <span>What to Expect: Therapy Process</span>
            <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-[#1A3828]/10 text-[#1A3828]">
              {steps.length} Steps
            </span>
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Guide prospective clients with transparent, comforting expectations from their initial intake to continuing support.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleAddStep}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#1A3828]/20 bg-white/80 hover:bg-white text-[#1A3828] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Publish Updates"}</span>
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`bg-white rounded-2xl border shadow-xs hover:border-[#1A3828]/25 p-5 transition-all space-y-4 ${
              step.isActive ? "border-[#1A3828]/10" : "border-slate-200 opacity-60 bg-slate-50/50"
            }`}
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#1A3828]/5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#1A3828] text-[#F4D242] font-playfair font-bold text-sm flex items-center justify-center shadow-xs">
                  {step.stepNumber}
                </span>
                <span className="font-playfair font-semibold text-sm text-[#1A3828]">
                  Phase {idx + 1}
                </span>
              </div>

              {/* Status & Reorder */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateField(idx, "isActive", !step.isActive)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 ${
                    step.isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {step.isActive ? (
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
                    onClick={() => moveStep(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/5 text-[#1A3828] disabled:opacity-30"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(idx, "down")}
                    disabled={idx === steps.length - 1}
                    className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/5 text-[#1A3828] disabled:opacity-30"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(step.id)}
                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors ml-1"
                    title="Delete Step"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Step Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Safe Space & Intake Discussion"
                value={step.title}
                onChange={(e) => updateField(idx, "title", e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans font-semibold text-[#1A3828]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Description & Expectation Guidance
              </label>
              <textarea
                rows={3}
                placeholder="Explain the environment, pace of conversation, and psychological grounding..."
                value={step.description}
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
        title="Remove Expectation Step"
        message="Are you sure you want to remove this step? Click 'Publish Updates' to save your changes."
        confirmText="Remove Step"
        isDestructive={true}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
