"use client";

import { ShieldAlert } from "lucide-react";

export default function CrisisBanner() {
  return (
    <div className="w-full bg-surface-container-high border-y border-outline-variant/30 py-space-sm px-gutter-mobile lg:px-gutter-desktop">
      <div className="max-w-container-max mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-xs text-center sm:text-left">
        <div className="flex items-center gap-space-xs text-warm-umber">
          <ShieldAlert className="w-4 h-4 text-secondary shrink-0" />
          <span className="font-body-sm text-body-sm text-[12px] text-on-surface-variant">
            <strong>Ethical Practice Note:</strong> Therapy is not an emergency crisis intervention service.
          </span>
        </div>
        <div className="font-body-sm text-body-sm text-[12px] text-on-surface-variant">
          If you are in immediate distress:{" "}
          <a
            href="tel:14416"
            className="text-primary font-semibold underline hover:text-secondary"
          >
            Tele-MANAS (14416)
          </a>{" "}
          or{" "}
          <a
            href="tel:9999666555"
            className="text-primary font-semibold underline hover:text-secondary"
          >
            Vandrevala (9999 666 555)
          </a>
        </div>
      </div>
    </div>
  );
}
