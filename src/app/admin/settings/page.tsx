"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  Building,
  Calendar,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import type { PracticeSettings } from "@/lib/types";

type TabType = "general" | "booking" | "notifications" | "security";

export default function AdminSettingsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<PracticeSettings | null>(null);

  // Password update form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isUpdatingPw, setIsUpdatingPw] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      success("Copied to clipboard!");
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Load settings
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load practice settings");
      const data = await res.json();
      setSettings(data.settings);
    } catch (err: any) {
      error(err.message || "Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save general settings
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ general: settings.general }),
      });
      if (!res.ok) throw new Error("Failed to update general settings");
      success("Practice details updated successfully.");
    } catch (err: any) {
      error(err.message || "Failed to save details.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save booking settings
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking: settings.booking }),
      });
      if (!res.ok) throw new Error("Failed to update booking rules");
      success("Booking rules & scheduling policies saved.");
    } catch (err: any) {
      error(err.message || "Failed to save booking rules.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save notifications settings
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: settings.notifications }),
      });
      if (!res.ok) throw new Error("Failed to update notification preferences");
      success("Notification preferences updated.");
    } catch (err: any) {
      error(err.message || "Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save account & password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      error("Please enter both current and new password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      error("New password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPw(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordUpdate: {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      success("Admin password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      error(err.message || "Failed to change password.");
    } finally {
      setIsUpdatingPw(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
        <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-sans text-[#7B7368]">Loading practice settings...</p>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "general", label: "General Practice", icon: Building },
    { key: "booking", label: "Booking & Policies", icon: Calendar },
    { key: "notifications", label: "Notification Alerts", icon: Bell },
    { key: "security", label: "Account & Password", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828]">
          Practice Settings
        </h1>
        <p className="text-sm text-[#7B7368] mt-1 font-sans">
          Manage clinical practice details, appointment booking provider, and account security.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-[#1A3828] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-[#7B7368] hover:text-[#1A3828] border border-[#1A3828]/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. GENERAL TAB */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1A3828]/10">
            <div>
              <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                Practice Profile & Contact
              </h3>
              <p className="text-xs text-[#7B7368] mt-0.5">
                Official information shown on appointment confirmations and email receipts.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] hover:bg-[#142C1F] text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Details"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Practice Name
              </label>
              <input
                type="text"
                value={settings.general.practiceName ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, practiceName: e.target.value },
                  })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Practice Tagline / Vision
              </label>
              <input
                type="text"
                value={settings.general.tagline ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, tagline: e.target.value },
                  })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Primary Contact Email
              </label>
              <input
                type="email"
                value={settings.general.contactEmail ?? settings.general.email ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: {
                      ...settings.general,
                      contactEmail: e.target.value,
                      email: e.target.value,
                    },
                  })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={settings.general.contactPhone ?? settings.general.phone ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: {
                      ...settings.general,
                      contactPhone: e.target.value,
                      phone: e.target.value,
                    },
                  })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Sanctuary Clinic Address (For In-Person Consultations)
            </label>
            <textarea
              rows={2}
              value={settings.general.clinicAddress ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, clinicAddress: e.target.value },
                })
              }
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none resize-none font-sans"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Currency
              </label>
              <input
                type="text"
                disabled
                value={settings.general.currency ?? "INR (₹)"}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/10 bg-slate-50 text-slate-600 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Timezone
              </label>
              <input
                type="text"
                disabled
                value={settings.general.timezone ?? "Asia/Kolkata (IST)"}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/10 bg-slate-50 text-slate-600 font-sans"
              />
            </div>
          </div>
        </form>
      )}

      {/* 2. BOOKING & POLICIES TAB */}
      {activeTab === "booking" && (
        <form onSubmit={handleSaveBooking} className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1A3828]/10">
            <div>
              <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                Appointment Engine & Policies
              </h3>
              <p className="text-xs text-[#7B7368] mt-0.5">
                Configure session duration, buffer times, and clinical scheduling policies.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] hover:bg-[#142C1F] text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Policies"}</span>
            </button>
          </div>

          {/* Booking Engine description */}
          <div className="rounded-xl bg-[#F0F7F2] border border-[#1A3828]/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[#1A3828]" />
                <span className="text-xs font-bold text-[#1A3828] uppercase tracking-wider">Interactive Booking Engine</span>
              </div>
              <p className="text-[11px] text-[#7B7368]">
                Sessions are booked directly through the website&#39;s native booking form with live consultation formats, slot pickers, and intake fields.
              </p>
            </div>
            <a
              href="/admin/content/booking-form"
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#1A3828] text-[#F4D242] text-xs font-semibold hover:bg-[#142C1F] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>Booking Form Controls</span>
              <span>→</span>
            </a>
          </div>

          {/* Payment & Checkout Mode Card */}
          <div className="rounded-xl bg-[#FAF9F5] border border-[#1A3828]/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1A3828]/10 flex items-center justify-center shrink-0 text-[#1A3828] mt-0.5">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-[#1A3828]">Razorpay Online Payments vs Pay Later</span>
                </div>
                <p className="text-[11px] text-[#7B7368]">
                  Require online payment via Razorpay (UPI, Cards, NetBanking) before appointments are secured, or enable direct bookings with manual settlement later at the clinic.
                </p>
              </div>
            </div>
            <a
              href="/admin/content/booking-form"
              className="shrink-0 px-3.5 py-1.5 rounded-lg border border-[#1A3828]/30 bg-white text-[#1A3828] hover:bg-[#1A3828] hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Payment Controls</span>
              <span>→</span>
            </a>
          </div>

          {/* Buffers & Rules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Buffer Between Sessions
              </label>
              <select
                value={settings.booking.bufferTimeMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking: {
                      ...settings.booking,
                      bufferTimeMinutes: Number(e.target.value),
                    },
                  })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans"
              >
                <option value={0}>0 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Advance Notice Required
              </label>
              <select
                value={settings.booking.advanceNoticeHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking: {
                      ...settings.booking,
                      advanceNoticeHours: Number(e.target.value),
                    },
                  })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans"
              >
                <option value={2}>2 hours prior</option>
                <option value={12}>12 hours prior</option>
                <option value={24}>24 hours prior</option>
                <option value={48}>48 hours prior</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Cancellation Grace Window
              </label>
              <select
                value={settings.booking.cancellationPolicyHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking: {
                      ...settings.booking,
                      cancellationPolicyHours: Number(e.target.value),
                    },
                  })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans"
              >
                <option value={12}>12 hours before session</option>
                <option value={24}>24 hours before session</option>
                <option value={48}>48 hours before session</option>
              </select>
            </div>
          </div>
        </form>
      )}

      {/* 3. NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <form onSubmit={handleSaveNotifications} className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1A3828]/10">
            <div>
              <h3 className="font-playfair text-base font-semibold text-[#1A3828]">
                Alerts & Automated Communications
              </h3>
              <p className="text-xs text-[#7B7368] mt-0.5">
                Control which email alerts and automated digests you receive.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] hover:bg-[#142C1F] text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[#1A3828]/10 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-semibold text-[#1A3828]">
                  Instant Email on New Booking
                </h4>
                <p className="text-[11px] text-[#7B7368] mt-0.5">
                  Send an email notification immediately when a client schedules a consultation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.emailOnBooking}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      emailOnBooking: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-[#1A3828] focus:ring-[#1A3828]"
              />
            </div>

            <div className="p-4 rounded-xl border border-[#1A3828]/10 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-semibold text-[#1A3828]">
                  Instant Email on Client Enquiry
                </h4>
                <p className="text-[11px] text-[#7B7368] mt-0.5">
                  Receive an alert when someone submits the website contact form.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.emailOnEnquiry}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      emailOnEnquiry: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-[#1A3828] focus:ring-[#1A3828]"
              />
            </div>

            <div className="p-4 rounded-xl border border-[#1A3828]/10 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-semibold text-[#1A3828]">
                  Daily Morning Digest
                </h4>
                <p className="text-[11px] text-[#7B7368] mt-0.5">
                  Receive a summary of today's schedule at 08:00 AM IST.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.dailySummaryDigest}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      dailySummaryDigest: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-[#1A3828] focus:ring-[#1A3828]"
              />
            </div>
          </div>
        </form>
      )}

      {/* 4. SECURITY & PASSWORD TAB */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Account Profile Summary */}
          <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4">
            <h3 className="font-playfair text-base font-semibold text-[#1A3828] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1A3828]" />
              <span>Admin Account Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FCF9F2] border border-[#1A3828]/10">
                <span className="text-[#7B7368]">Account Holder</span>
                <div className="font-semibold text-[#1A3828] text-sm mt-0.5">
                  {settings.account.adminName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FCF9F2] border border-[#1A3828]/10">
                <span className="text-[#7B7368]">Login Email</span>
                <div className="font-semibold text-[#1A3828] text-sm mt-0.5">
                  {settings.account.email}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FCF9F2] border border-[#1A3828]/10">
                <span className="text-[#7B7368]">Access Level</span>
                <div className="font-semibold text-[#1A3828] text-sm mt-0.5">
                  Primary Clinician & Practice Owner
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl border border-[#1A3828]/10 p-6 shadow-xs space-y-4 max-w-xl">
            <div className="pb-3 border-b border-[#1A3828]/10">
              <h3 className="font-playfair text-base font-semibold text-[#1A3828] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#1A3828]" />
                <span>Change Administrator Password</span>
              </h3>
              <p className="text-xs text-[#7B7368] mt-0.5">
                Use a strong, unique password to secure confidential clinical records.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full text-xs p-2.5 pr-9 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B7368] hover:text-[#1A3828]"
                >
                  {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full text-xs p-2.5 pr-9 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B7368] hover:text-[#1A3828]"
                  >
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPw}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] hover:bg-[#142C1F] text-white transition-all disabled:opacity-50 shadow-sm"
              >
                {isUpdatingPw ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
