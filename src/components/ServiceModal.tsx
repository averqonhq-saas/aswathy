"use client";

import Link from "next/link";
import { X, Check, ArrowRight, Clock, Shield, Sparkles } from "lucide-react";

export interface ServiceDetail {
  id: string;
  title: string;
  badge: string;
  icon: string;
  summary: string;
  description: string;
  focusAreas: string[];
  takeaways: string[];
  duration: string;
  format: string;
  price?: number;
}

interface ServiceModalProps {
  service: ServiceDetail | null;
  onClose: () => void;
  onBook?: (serviceTitle: string) => void;
}

export default function ServiceModal({
  service,
  onClose,
  onBook,
}: ServiceModalProps) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-space-xl pb-space-md border-b border-surface-container flex items-start justify-between bg-surface-container-low">
          <div className="space-y-space-xxs">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-surface text-secondary font-label-caps text-label-caps uppercase tracking-wider">
              <span>{service.badge}</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary tracking-tight">
              {service.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-space-xl space-y-space-lg overflow-y-auto custom-scrollbar">
          <p className="font-body-lg text-body-lg text-primary/90 leading-relaxed font-serif italic">
            &ldquo;{service.summary}&rdquo;
          </p>

          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {service.description}
          </p>

          {/* Logistics meta bar */}
          <div className={`grid ${service.price ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"} gap-space-sm p-space-md rounded-2xl bg-surface-container text-primary`}>
            <div className="flex items-center gap-space-xs">
              <Clock className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant block text-[10px]">
                  Duration
                </span>
                <span className="font-body-sm text-body-sm font-semibold">
                  {service.duration}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <Shield className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant block text-[10px]">
                  Setting
                </span>
                <span className="font-body-sm text-body-sm font-semibold">
                  {service.format}
                </span>
              </div>
            </div>
            {service.price ? (
              <div className="flex items-center gap-space-xs col-span-2 sm:col-span-1">
                <Sparkles className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant block text-[10px]">
                    Consultation Fee
                  </span>
                  <span className="font-body-sm text-body-sm font-semibold">
                    ₹{service.price}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Focus Areas List */}
          <div className="space-y-space-xs">
            <h4 className="font-headline-sm text-headline-sm text-primary text-base">
              Common Themes We Unpack
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
              {service.focusAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-space-xs text-on-surface-variant font-body-sm text-body-sm"
                >
                  <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Takeaways */}
          <div className="space-y-space-xs">
            <h4 className="font-headline-sm text-headline-sm text-primary text-base">
              What We Work Towards
            </h4>
            <div className="space-y-space-xxs">
              {service.takeaways.map((takeaway, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-space-xs text-on-surface-variant font-body-sm text-body-sm"
                >
                  <Check className="w-4 h-4 text-secondary-fixed-dim shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-space-xl pt-space-md border-t border-surface-container bg-surface flex items-center justify-between gap-space-md">
          <button
            onClick={onClose}
            className="px-space-lg py-space-sm rounded-full text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors cursor-pointer"
          >
            Close
          </button>
          <Link
            href="/book-a-session#booking-form"
            onClick={onClose}
            className="px-space-xl py-space-sm rounded-full bg-primary text-surface hover:bg-primary-container transition-all duration-300 font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-md group"
          >
            <span>Book Consultation for This Area</span>
            <ArrowRight className="w-4 h-4 text-secondary-container transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
