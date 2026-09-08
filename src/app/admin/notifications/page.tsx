"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  CalendarCheck,
  MessageSquare,
  Sparkles,
  Trash2,
  Check,
  ArrowRight,
  Shield,
  Info,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import type { Notification } from "@/lib/types";

export default function AdminNotificationsPage() {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      error(err.message || "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (!res.ok) throw new Error("Failed to mark read");
      success("All notifications marked as read.");
      loadNotifications();
    } catch (err: any) {
      error(err.message || "Failed to mark notifications read.");
    }
  };

  // Mark single read
  const handleMarkRead = async (id: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Clear single
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE",
      });
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all
  const handleClearAll = async () => {
    try {
      const res = await fetch("/api/admin/notifications?id=all", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear");
      success("Notification history cleared.");
      setIsClearingAll(false);
      loadNotifications();
    } catch (err: any) {
      error(err.message || "Failed to clear notifications.");
    }
  };

  // Helper for icons
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "booking_new":
      case "booking_rescheduled":
        return <CalendarCheck className="w-4 h-4 text-emerald-700" />;
      case "booking_cancel":
      case "booking_cancelled":
        return <Clock className="w-4 h-4 text-rose-700" />;
      case "enquiry_new":
        return <MessageSquare className="w-4 h-4 text-amber-700" />;
      case "feedback_new":
        return <Sparkles className="w-4 h-4 text-[#F4D242]" />;
      default:
        return <Info className="w-4 h-4 text-[#1A3828]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
            <span>Practice Activity & Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-sans font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Real-time activity feed of client bookings, intake requests, and system events.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/80 hover:bg-white text-[#1A3828] border border-[#1A3828]/20 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All as Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setIsClearingAll(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/80 hover:bg-rose-50 text-rose-700 border border-rose-200 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Feed</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filter === "all"
              ? "bg-[#1A3828] text-white shadow-xs"
              : "bg-white text-[#7B7368] hover:text-[#1A3828] border border-[#1A3828]/10"
          }`}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filter === "unread"
              ? "bg-[#1A3828] text-white shadow-xs"
              : "bg-white text-[#7B7368] hover:text-[#1A3828] border border-[#1A3828]/10"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
          <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-sans text-[#7B7368]">Loading activity feed...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm">
          <Bell className="w-12 h-12 text-[#1A3828]/20 mx-auto mb-3" />
          <h3 className="font-playfair text-lg font-semibold text-[#1A3828]">No notifications</h3>
          <p className="text-xs text-[#7B7368] mt-1">
            {filter === "unread"
              ? "You have reviewed all current activity."
              : "Your activity feed is quiet right now."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 shadow-sm divide-y divide-[#1A3828]/5 overflow-hidden">
          {filteredNotifications.map((notif) => {
            const timeAgo = new Date(notif.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={notif.id}
                className={`p-4 md:p-5 flex items-start justify-between gap-4 transition-colors ${
                  !notif.isRead ? "bg-[#FCF9F2]/50 font-medium" : "hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !notif.isRead
                        ? "bg-[#1A3828]/10 text-[#1A3828] ring-2 ring-[#F4D242]"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {getIcon(notif.type)}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs md:text-sm font-semibold text-[#1A3828]">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-[#7B7368] leading-relaxed font-normal">
                      {notif.message}
                    </p>
                    <div className="text-[11px] text-[#7B7368] flex items-center gap-1 font-normal pt-0.5">
                      <Clock className="w-3 h-3 text-[#7B7368]/60" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 self-center">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={() => handleMarkRead(notif.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828] transition-colors flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1.5 rounded-lg text-[#7B7368] hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 rounded-lg text-[#7B7368] hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Remove notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRM CLEAR FEED DIALOG */}
      <ConfirmDialog
        isOpen={isClearingAll}
        title="Clear Activity Feed"
        message="Are you sure you want to clear your entire activity and notification history? This will remove all previous alerts."
        confirmText="Clear Feed"
        isDestructive={true}
        onConfirm={handleClearAll}
        onClose={() => setIsClearingAll(false)}
      />
    </div>
  );
}
