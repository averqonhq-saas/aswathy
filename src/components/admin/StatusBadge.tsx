import React from "react";

export interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusBadge({
  status,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/_/g, " ").trim();

  let style = "bg-surface-container text-on-surface-variant border-surface-container-high";
  let dotColor = "bg-outline";

  switch (normalized) {
    case "confirmed":
    case "active":
    case "approved":
    case "paid":
    case "resolved":
      style = "bg-[#E7F3EC] text-[#1B5E20] border-[#C8E6C9]";
      dotColor = "bg-[#2E7D32]";
      break;

    case "pending":
    case "new":
    case "contacted":
      style = "bg-[#FEF7E0] text-[#8D6B00] border-[#FEEAA0]";
      dotColor = "bg-[#F4D242]";
      break;

    case "completed":
      style = "bg-[#E8F0FE] text-[#1A73E8] border-[#C2D7FF]";
      dotColor = "bg-[#1967D2]";
      break;

    case "cancelled":
    case "hidden":
    case "disabled":
    case "refunded":
      style = "bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]";
      dotColor = "bg-[#D93025]";
      break;

    case "follow up":
      style = "bg-[#F3E8FD] text-[#6B21A8] border-[#E9D5FF]";
      dotColor = "bg-[#7E22CE]";
      break;
  }

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border capitalize tracking-wide font-label-md ${sizeClasses} ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{normalized}</span>
    </span>
  );
}
