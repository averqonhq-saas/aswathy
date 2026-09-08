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
  Video,
  Building2,
  Clock,
  Tag,
  ListOrdered,
  Layers,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import type { SessionStep } from "@/lib/types";
import type { SessionFormat } from "@/lib/booking-config";

export default function AdminContentSessionPage() {
  const { success, error } = useToast();

  // Active Tab: "formats" | "steps"
  const [activeTab, setActiveTab] = useState<"formats" | "steps">("formats");

  // State
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const [formats, setFormats] = useState<SessionFormat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Deletion confirm states
  const [deletingStepId, setDeletingStepId] = useState<string | null>(null);
  const [deletingFormatId, setDeletingFormatId] = useState<string | null>(null);

  // Load session steps and formats
  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/content/session");
      if (!res.ok) throw new Error("Failed to load session content");
      const result = await res.json();

      if (result.data) {
        if (Array.isArray(result.data)) {
          setSteps(result.data);
        } else {
          setSteps(result.data.steps || []);
          setFormats(result.data.formats || []);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load content";
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------------------------------
  // SESSION FORMATS HANDLERS
  // ----------------------------------------------------
  const handleAddFormat = () => {
    const newFormat: SessionFormat = {
      id: `fmt_${Date.now()}`,
      title: "New Session Format",
      format: "online",
      duration: "50 Minutes · Secure Video",
      tag: "Video Consultation",
      badge: "New",
      badgeType: "popular",
      description: "Describe what this consultation offers and who it is best suited for.",
      icon: "video",
      price: 1800,
      isActive: true,
      order: formats.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFormats([...formats, newFormat]);
    success("New session format added. Customize fields and click 'Publish Updates'.");
  };

  const moveFormat = (index: number, direction: "up" | "down") => {
    const nextIdx = direction === "up" ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= formats.length) return;
    const copy = [...formats];
    const temp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = temp;
    copy.forEach((f, idx) => {
      f.order = idx + 1;
    });
    setFormats(copy);
  };

  const updateFormatField = (index: number, field: keyof SessionFormat, value: unknown) => {
    const copy = [...formats];
    copy[index] = { ...copy[index], [field]: value };
    setFormats(copy);
  };

  const handleDeleteFormat = () => {
    if (!deletingFormatId) return;
    const filtered = formats.filter((f) => f.id !== deletingFormatId);
    filtered.forEach((f, idx) => {
      f.order = idx + 1;
    });
    setFormats(filtered);
    setDeletingFormatId(null);
    success("Session format removed. Click 'Publish Updates' to persist changes.");
  };

  // ----------------------------------------------------
  // SESSION STEPS (WHAT TO EXPECT) HANDLERS
  // ----------------------------------------------------
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

  const moveStep = (index: number, direction: "up" | "down") => {
    const nextIdx = direction === "up" ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= steps.length) return;
    const copy = [...steps];
    const temp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = temp;
    copy.forEach((s, idx) => {
      s.stepNumber = `0${idx + 1}`.slice(-2);
      s.order = idx + 1;
    });
    setSteps(copy);
  };

  const updateStepField = (index: number, field: keyof SessionStep, value: unknown) => {
    const copy = [...steps];
    copy[index] = { ...copy[index], [field]: value };
    setSteps(copy);
  };

  const handleDeleteStep = () => {
    if (!deletingStepId) return;
    const filtered = steps.filter((s) => s.id !== deletingStepId);
    filtered.forEach((s, idx) => {
      s.stepNumber = `0${idx + 1}`.slice(-2);
      s.order = idx + 1;
    });
    setSteps(filtered);
    setDeletingStepId(null);
    success("Step removed. Click 'Publish Updates' to persist changes.");
  };

  // ----------------------------------------------------
  // SAVE ALL (FORMATS + STEPS)
  // ----------------------------------------------------
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/content/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formats: formats,
          steps: steps,
        }),
      });
      if (!res.ok) throw new Error("Failed to update session content");
      success("Session options & therapy steps published to website.");
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save.";
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-xs animate-pulse">
        <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-sans text-[#7B7368]">Loading session configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
            <span>Session &amp; Booking Management</span>
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Configure the session consultation formats displayed on the live booking form and the therapeutic journey steps.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {activeTab === "formats" ? (
            <button
              onClick={handleAddFormat}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#1A3828]/20 bg-white/80 hover:bg-white text-[#1A3828] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Session Format</span>
            </button>
          ) : (
            <button
              onClick={handleAddStep}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#1A3828]/20 bg-white/80 hover:bg-white text-[#1A3828] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Journey Step</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Publish Updates"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1A3828]/10 pb-2">
        <button
          onClick={() => setActiveTab("formats")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "formats"
              ? "bg-[#1A3828] text-[#F4D242] shadow-xs"
              : "text-[#7B7368] hover:text-[#1A3828] hover:bg-[#1A3828]/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Session Formats (Booking Form Cards)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
            {formats.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("steps")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "steps"
              ? "bg-[#1A3828] text-[#F4D242] shadow-xs"
              : "text-[#7B7368] hover:text-[#1A3828] hover:bg-[#1A3828]/5"
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Therapy Journey (What to Expect)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
            {steps.length}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: SESSION FORMATS (BOOKING FORM CARDS)                   */}
      {/* ============================================================ */}
      {activeTab === "formats" && (
        <div className="space-y-4">
          <div className="bg-[#fcf9f2] p-4 rounded-xl border border-[#e2d9ce] text-xs text-[#5a4033] flex items-center justify-between">
            <span>
              These formats appear in <strong>Step 1: Choose Session Format</strong> of the live booking form. Any updates or new formats added here sync instantly to the booking page.
            </span>
          </div>

          {formats.map((fmt, idx) => (
            <div
              key={fmt.id}
              className={`bg-white rounded-2xl border shadow-xs hover:border-[#1A3828]/25 p-5 sm:p-6 transition-all space-y-4 ${
                fmt.isActive ? "border-[#1A3828]/10" : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              {/* Header row: Status + Order controls */}
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#1A3828]/5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#1A3828] text-[#F4D242] font-semibold text-xs flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-playfair font-semibold text-sm text-[#1A3828] block">
                      {fmt.title || "Untitled Session Format"}
                    </span>
                    <span className="text-[11px] text-[#7B7368]">
                      {fmt.format === "online" ? "Telehealth (Video)" : "In-Person (Studio)"} · {fmt.duration}
                    </span>
                  </div>
                </div>

                {/* Status & Reorder */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateFormatField(idx, "isActive", !fmt.isActive)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      fmt.isActive
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {fmt.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Active on Website
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
                      onClick={() => moveFormat(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/5 text-[#1A3828] disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFormat(idx, "down")}
                      disabled={idx === formats.length - 1}
                      className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/5 text-[#1A3828] disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingFormatId(fmt.id)}
                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors ml-1 cursor-pointer"
                      title="Delete Format"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Format Title *
                  </label>
                  <input
                    type="text"
                    value={fmt.title}
                    onChange={(e) => updateFormatField(idx, "title", e.target.value)}
                    placeholder="e.g., Individual Online Counselling"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans font-semibold text-[#1A3828]"
                  />
                </div>

                {/* Modality */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Modality *
                  </label>
                  <select
                    value={fmt.format}
                    onChange={(e) => updateFormatField(idx, "format", e.target.value as "online" | "in-person")}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828] cursor-pointer"
                  >
                    <option value="online">Online (Secure Video)</option>
                    <option value="in-person">In-Person (Studio)</option>
                  </select>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Card Icon *
                  </label>
                  <select
                    value={fmt.icon}
                    onChange={(e) => updateFormatField(idx, "icon", e.target.value as "video" | "studio" | "discovery")}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828] cursor-pointer"
                  >
                    <option value="video">📹 Video / Camera</option>
                    <option value="studio">🏛️ Studio / Building</option>
                    <option value="discovery">✨ Sparkle / Discovery</option>
                  </select>
                </div>

                {/* Duration Line */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Duration Subtitle *
                  </label>
                  <input
                    type="text"
                    value={fmt.duration}
                    onChange={(e) => updateFormatField(idx, "duration", e.target.value)}
                    placeholder="e.g., 50 Minutes · Secure Video"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                  />
                </div>

                {/* Category Tag */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Bottom Tag *
                  </label>
                  <input
                    type="text"
                    value={fmt.tag}
                    onChange={(e) => updateFormatField(idx, "tag", e.target.value)}
                    placeholder="e.g., Video Consultation"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                  />
                </div>

                {/* Badge text */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Badge Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={fmt.badge || ""}
                    onChange={(e) => updateFormatField(idx, "badge", e.target.value)}
                    placeholder="e.g., Popular, Introductory"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans text-[#1A3828]"
                  />
                </div>

                {/* Badge Style */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                    Badge Color Theme
                  </label>
                  <select
                    value={fmt.badgeType || "popular"}
                    onChange={(e) => updateFormatField(idx, "badgeType", e.target.value as "popular" | "in-person" | "introductory")}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828] cursor-pointer"
                  >
                    <option value="popular">Gold / Yellow (Popular)</option>
                    <option value="introductory">Peach / Soft Rose (Introductory)</option>
                    <option value="in-person">Neutral Beige (In-Person)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Card Description *
                </label>
                <textarea
                  rows={2}
                  value={fmt.description}
                  onChange={(e) => updateFormatField(idx, "description", e.target.value)}
                  placeholder="Consult from your personal sanctuary via secure private link..."
                  className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans leading-relaxed resize-none text-[#1A3828]"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: THERAPY JOURNEY (WHAT TO EXPECT)                      */}
      {/* ============================================================ */}
      {activeTab === "steps" && (
        <div className="space-y-4">
          <div className="bg-[#fcf9f2] p-4 rounded-xl border border-[#e2d9ce] text-xs text-[#5a4033]">
            These 5 journey phases appear in the <strong>&quot;What to Expect&quot;</strong> section across the website and booking page.
          </div>

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
                    onClick={() => updateStepField(idx, "isActive", !step.isActive)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
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
                      className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/5 text-[#1A3828] disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(idx, "down")}
                      disabled={idx === steps.length - 1}
                      className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/5 text-[#1A3828] disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingStepId(step.id)}
                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors ml-1 cursor-pointer"
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
                  onChange={(e) => updateStepField(idx, "title", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans font-semibold text-[#1A3828]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Description &amp; Expectation Guidance
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain the environment, pace of conversation, and psychological grounding..."
                  value={step.description}
                  onChange={(e) => updateStepField(idx, "description", e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans leading-relaxed resize-none text-[#1A3828]"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRM DELETE FORMAT DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingFormatId)}
        title="Remove Session Format"
        message="Are you sure you want to remove this consultation format? It will no longer appear on the live booking form. Click 'Publish Updates' to persist."
        confirmText="Remove Format"
        isDestructive={true}
        onConfirm={handleDeleteFormat}
        onClose={() => setDeletingFormatId(null)}
      />

      {/* CONFIRM DELETE STEP DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingStepId)}
        title="Remove Expectation Step"
        message="Are you sure you want to remove this step? Click 'Publish Updates' to save your changes."
        confirmText="Remove Step"
        isDestructive={true}
        onConfirm={handleDeleteStep}
        onClose={() => setDeletingStepId(null)}
      />
    </div>
  );
}
