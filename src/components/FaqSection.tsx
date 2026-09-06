"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What happens in our very first session?",
      a: "The first session is gentle and unhurried. We take time to get to know each other, explore what brought you to therapy, discuss what you hope to experience, and answer any questions you have about the therapeutic process. There is never any pressure to dive into deep trauma or speak about anything before you feel ready.",
    },
    {
      q: "Are all sessions conducted online?",
      a: "Yes. All consultations are held 100% online via secure, encrypted Google Meet telehealth links. This allows you to speak from the comfort, safety, and confidentiality of your own private space anywhere in India or internationally, without commuting stress.",
    },
    {
      q: "How strictly confidential are our conversations?",
      a: "Your privacy is sacred. Everything shared in our sessions is strictly confidential in accordance with professional psychological ethics and legal standards. The only standard ethical exceptions involve imminent risk of severe harm to yourself or others, which would always be handled with transparent care.",
    },
    {
      q: "What if I don't know where to start or feel nervous?",
      a: "Feeling nervous or uncertain is completely natural. You do not need to arrive with an agenda or polished explanations. It is my role as your psychologist to facilitate an open, gentle dialogue through thoughtful questions and patient pauses.",
    },
    {
      q: "How often will we meet?",
      a: "Most clients begin with weekly or bi-weekly 50-minute sessions to build momentum and rapport. As you gain clarity and emotional grounding, we collaboratively review and adjust the frequency to suit your personal pace and schedule.",
    },
    {
      q: "How do I book, and what are the payment arrangements?",
      a: "You can easily schedule a consultation using the 'Book a Session' button on this website. After selecting your preferred date and format, you will receive confirmation details and payment guidelines via email or WhatsApp.",
    },
  ];

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
                >
                  <span className="font-headline-sm text-headline-sm text-primary text-base md:text-lg">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0 text-secondary transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-primary text-surface" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-space-lg pb-space-lg pt-0 animate-fadeIn">
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed border-t border-surface-container-high pt-space-sm">
                      {faq.a}
                    </p>
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
