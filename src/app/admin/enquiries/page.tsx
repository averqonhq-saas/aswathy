"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Sparkles,
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Drawer from "@/components/admin/Drawer";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { Enquiry } from "@/lib/db";

export default function AdminEnquiriesPage() {
  const { success, error } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer state
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete dialog state
  const [deletingEnquiry, setDeletingEnquiry] = useState<Enquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load enquiries
  const loadEnquiries = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/enquiries");
      if (!res.ok) throw new Error("Failed to load enquiries");
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (err: any) {
      error(err.message || "Failed to load enquiries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  // Sync selected enquiry notes
  useEffect(() => {
    if (selectedEnquiry) {
      setAdminNoteInput(selectedEnquiry.internalNotes || "");
    }
  }, [selectedEnquiry]);

  // Filtered List
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      const matchesStatus =
        activeStatus === "all" || e.status === activeStatus;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [enquiries, activeStatus, searchQuery]);

  // Counts by status
  const counts = useMemo(() => {
    const res = {
      all: enquiries.length,
      new: 0,
      contacted: 0,
      follow_up: 0,
      resolved: 0,
    };
    enquiries.forEach((e) => {
      if (res[e.status] !== undefined) {
        res[e.status]++;
      }
    });
    return res;
  }, [enquiries]);

  // Change status
  const handleStatusChange = async (status: Enquiry["status"]) => {
    if (!selectedEnquiry) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      success(`Enquiry marked as ${status.replace("_", " ")}`);
      setSelectedEnquiry(data.enquiry);
      loadEnquiries();
    } catch (err: any) {
      error(err.message || "Failed to change status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Save internal notes
  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: adminNoteInput }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      const data = await res.json();
      success("Notes updated successfully.");
      setSelectedEnquiry(data.enquiry);
      loadEnquiries();
    } catch (err: any) {
      error(err.message || "Failed to update note");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete enquiry
  const handleDeleteEnquiry = async () => {
    if (!deletingEnquiry) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${deletingEnquiry.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete enquiry");
      success("Enquiry removed from records.");
      if (selectedEnquiry?.id === deletingEnquiry.id) {
        setSelectedEnquiry(null);
      }
      setDeletingEnquiry(null);
      loadEnquiries();
    } catch (err: any) {
      error(err.message || "Failed to delete enquiry");
    } finally {
      setIsDeleting(false);
    }
  };

  const statusTabs: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All Messages", count: counts.all },
    { key: "new", label: "New", count: counts.new },
    { key: "contacted", label: "Contacted", count: counts.contacted },
    { key: "follow_up", label: "Follow Up", count: counts.follow_up },
    { key: "resolved", label: "Resolved", count: counts.resolved },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
          <span>Client Enquiries</span>
          {counts.new > 0 && (
            <span className="text-xs font-sans font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              {counts.new} New to review
            </span>
          )}
        </h1>
        <p className="text-sm text-[#7B7368] mt-1 font-sans">
          Review potential client inquiries from your contact form and track follow-up progress.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-[#1A3828] text-white shadow-xs"
                    : "bg-white/80 hover:bg-white text-[#7B7368] hover:text-[#1A3828] border border-[#1A3828]/10"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#1A3828]/5 text-[#1A3828]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#7B7368] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#1A3828]/15 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
          />
        </div>
      </div>

      {/* Enquiries List */}
      {isLoading ? (
        <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
          <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-sans text-[#7B7368]">Loading enquiries...</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm">
          <MessageSquare className="w-12 h-12 text-[#1A3828]/20 mx-auto mb-3" />
          <h3 className="font-playfair text-lg font-semibold text-[#1A3828]">No enquiries found</h3>
          <p className="text-xs text-[#7B7368] mt-1">
            {searchQuery || activeStatus !== "all"
              ? "No messages match your selected filters."
              : "Your inbox is clear. New inquiries from the website will appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 shadow-sm divide-y divide-[#1A3828]/5 overflow-hidden">
          {filteredEnquiries.map((enq) => {
            const isNew = enq.status === "new";
            const dateDisplay = new Date(enq.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={enq.id}
                onClick={() => setSelectedEnquiry(enq)}
                className={`p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors cursor-pointer hover:bg-[#FCF9F2]/50 ${
                  isNew ? "bg-[#FCF9F2]/30 font-medium" : ""
                }`}
              >
                {/* Left Profile & Subject */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-playfair font-bold text-sm ${
                      isNew
                        ? "bg-[#F4D242]/30 text-[#1A3828] ring-2 ring-[#F4D242]"
                        : "bg-[#1A3828]/5 text-[#1A3828]"
                    }`}
                  >
                    {enq.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-semibold text-sm text-[#1A3828] truncate">{enq.name}</h4>
                      <StatusBadge status={enq.status} />
                      {isNew && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-[#1A3828]/80 truncate">
                      {enq.subject}
                    </p>

                    <p className="text-xs text-[#7B7368] line-clamp-2 pr-4 font-normal">
                      {enq.message}
                    </p>

                    <div className="pt-1 flex items-center gap-4 text-[11px] text-[#7B7368] font-normal flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#1A3828]/50" /> {enq.email}
                      </span>
                      {enq.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#1A3828]/50" /> {enq.phone}
                        </span>
                      )}
                      <span>•</span>
                      <span>Received {dateDisplay}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEnquiry(enq);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828] transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingEnquiry(enq);
                    }}
                    className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Delete enquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ENQUIRY DETAILS DRAWER */}
      <Drawer
        isOpen={Boolean(selectedEnquiry)}
        onClose={() => setSelectedEnquiry(null)}
        title="Client Inquiry"
        subtitle={
          selectedEnquiry
            ? `Received on ${new Date(selectedEnquiry.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}`
            : ""
        }
        footer={
          selectedEnquiry && (
            <div className="flex items-center justify-between gap-3 w-full">
              <a
                href={`mailto:${selectedEnquiry.email}?subject=Re: ${encodeURIComponent(
                  selectedEnquiry.subject
                )}`}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply via Email</span>
              </a>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828]"
              >
                Close
              </button>
            </div>
          )
        }
      >
        {selectedEnquiry && (
          <div className="space-y-6">
            {/* Status Workflow Selector */}
            <div className="bg-[#FCF9F2] p-4 rounded-2xl border border-[#1A3828]/10 space-y-2">
              <span className="text-xs text-[#7B7368] uppercase font-bold tracking-wider">
                Follow-Up Stage
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {(["new", "contacted", "follow_up", "resolved"] as Enquiry["status"][]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      disabled={isUpdating}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                        selectedEnquiry.status === st
                          ? "bg-[#1A3828] text-white shadow-xs"
                          : "bg-white text-[#7B7368] hover:text-[#1A3828] border border-[#1A3828]/15"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Client Profile Card */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#7B7368]">
                Sender Information
              </h5>
              <div className="bg-white p-4 rounded-2xl border border-[#1A3828]/10 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#7B7368]">Name</span>
                  <span className="font-semibold text-[#1A3828]">{selectedEnquiry.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B7368]">Email</span>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="text-[#1A3828] underline font-medium hover:opacity-80 flex items-center gap-1"
                  >
                    <span>{selectedEnquiry.email}</span>
                    <ExternalLink className="w-3 h-3 text-[#7B7368]" />
                  </a>
                </div>
                {selectedEnquiry.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#7B7368]">Phone</span>
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="text-[#1A3828] font-medium hover:opacity-80 flex items-center gap-1"
                    >
                      <span>{selectedEnquiry.phone}</span>
                      <Phone className="w-3 h-3 text-[#7B7368]" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Subject & Full Message */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#7B7368]">
                Inquiry Message
              </h5>
              <div className="bg-white p-4 rounded-2xl border border-[#1A3828]/10 space-y-2">
                <h4 className="font-semibold text-sm text-[#1A3828]">
                  {selectedEnquiry.subject}
                </h4>
                <p className="text-xs text-[#1A3828] leading-relaxed whitespace-pre-wrap font-sans bg-[#FCF9F2]/50 p-3 rounded-xl border border-[#1A3828]/5">
                  {selectedEnquiry.message}
                </p>
              </div>
            </div>

            {/* Private Notes for Psychologist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#7B7368]">
                  Internal Tracking Notes
                </h5>
                <span className="text-[10px] text-[#7B7368]">Psychologist only</span>
              </div>
              <textarea
                rows={4}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Notes on communication, suggested service fit, response summary, etc..."
                className="w-full text-xs p-3 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828] resize-none"
              />
              <div className="text-right">
                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1A3828] text-white hover:bg-[#142C1F] transition-colors disabled:opacity-50"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingEnquiry)}
        title="Delete Enquiry"
        message={`Are you sure you want to permanently remove this message from ${deletingEnquiry?.name}?`}
        confirmText="Delete Message"
        isDestructive={true}
        onConfirm={handleDeleteEnquiry}
        onClose={() => setDeletingEnquiry(null)}
      />
    </div>
  );
}
