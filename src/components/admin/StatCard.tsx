import React from "react";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: "positive" | "neutral" | "attention";
  trend?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = "positive",
}: StatCardProps) {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-parchment-border/80 shadow-[0_2px_12px_rgba(26,56,40,0.04)] hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider block">
            {title}
          </span>
          <div className="font-headline-md text-3xl font-semibold text-primary tracking-tight">
            {value}
          </div>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-forest-green/10 flex items-center justify-center text-forest-green group-hover:scale-105 transition-transform duration-300">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-on-surface-variant font-body-sm">{subtitle}</span>
          )}
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                badgeType === "positive"
                  ? "bg-[#E7F3EC] text-[#1B5E20]"
                  : badgeType === "attention"
                  ? "bg-[#FEF7E0] text-[#B78103]"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
