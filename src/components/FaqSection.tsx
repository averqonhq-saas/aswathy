"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DEFAULT_FAQS, type FaqItem } from "@/lib/faq-data";
export { DEFAULT_FAQS, type FaqItem };

export default function FaqSection({ faqs = DEFAULT_FAQS }: { faqs?: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-space-3xl lg:py-space-4xl px-gutter-mobile lg:px-gutter-desktop scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto space-y-space-2xl">
        <div className="text-center space-y-space-xs">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
            Common Inquiries
          </span>
          <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Clear, open answers to help you feel informed and at ease.
          </p>
        </div>

        <div className="space-y-space-sm">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-surface-container overflow-hidden transition-all duration-300 border border-transparent hover:border-parchment-border"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-space-lg text-left flex items-center justify-between gap-space-md cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <h3 className="font-headline-sm text-headline-sm text-primary text-base md:text-lg">
                    {faq.q}
                  </h3>
                  <div
                    className={`w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-secondary/10 text-secondary" : "text-primary"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className="px-space-lg pb-space-lg pt-space-xs text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-parchment-border/40"
                  >
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
