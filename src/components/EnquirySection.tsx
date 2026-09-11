"use client";

import React, { useState } from "react";
import {
  Send,
  Mail,
  Phone,
  User,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function EnquirySection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Consultation Inquiry",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage("Please write a short note or question.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "General Consultation Inquiry",
          message: "",
        });
      } else {
        setErrorMessage(data.error || "Unable to send your inquiry. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection or contact us via email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="enquiry"
      className="w-full bg-surface py-space-3xl lg:py-space-4xl px-gutter-mobile lg:px-gutter-desktop scroll-mt-20 relative overflow-hidden"
    >
      {/* Decorative ambient background accents */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-secondary-fixed/20 blur-[90px] -z-0"></div>
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-primary-fixed/20 blur-[100px] -z-0"></div>

      <div className="max-w-container-max mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl lg:gap-space-3xl items-start">
          {/* Left Column: Context, Reassurance & Direct Details */}
          <div className="lg:col-span-5 space-y-space-lg">
            <div className="space-y-space-xs">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-surface-container text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                  Warm Inquiry
                </span>
              </div>
              <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
                Have questions before{" "}
                <span className="italic font-normal text-soft-terracotta">
                  you begin?
                </span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pt-space-xs">
                Reaching out for psychological support can feel like a significant
                step. If you have questions about the format, session focus, or
                comfort level, you are welcome to send an unhurried message here.
              </p>
            </div>

            {/* Reassurance Pillars */}
            <div className="space-y-space-sm pt-space-xs">
              <div className="flex items-start gap-space-sm p-space-md rounded-2xl bg-surface-container-low border border-parchment-border/60">
                <div className="w-9 h-9 rounded-full bg-secondary-fixed/30 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <ShieldCheck className="w-5 h-5 text-forest-green" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm text-primary font-medium">
                    100% Confidential
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Your details and questions are kept in strict ethical confidence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-sm p-space-md rounded-2xl bg-surface-container-low border border-parchment-border/60">
                <div className="w-9 h-9 rounded-full bg-secondary-fixed/30 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <Clock className="w-5 h-5 text-forest-green" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm text-primary font-medium">
                    Personal Practitioner Response
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Aswathy personally reviews each inquiry and responds within 24 to 48 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-sm p-space-md rounded-2xl bg-surface-container-low border border-parchment-border/60">
                <div className="w-9 h-9 rounded-full bg-secondary-fixed/30 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <Sparkles className="w-5 h-5 text-forest-green" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm text-primary font-medium">
                    No Obligation
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Asking a question does not commit you to booking a session.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Email fallback */}
            <div className="pt-space-xs text-on-surface-variant text-xs flex flex-col gap-1">
              <span>Prefer direct correspondence?</span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <a
                  href="mailto:roottherapyonline@gmail.com"
                  className="font-medium text-primary hover:text-secondary underline underline-offset-4 decoration-secondary transition-colors"
                >
                  roottherapyonline@gmail.com
                </a>
                <span>•</span>
                <a
                  href="tel:+917550002973"
                  className="font-medium text-primary hover:text-secondary underline underline-offset-4 decoration-secondary transition-colors"
                >
                  +91 755 000 2973
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-low rounded-3xl p-space-xl lg:p-space-2xl border border-parchment-border/80 shadow-[0_8px_32px_rgba(74,51,40,0.04)] relative">
              {submitSuccess ? (
                <div className="py-12 px-4 text-center space-y-space-md animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-[#E7F3EC] text-forest-green flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-[#1B5E20]" />
                  </div>
                  <div className="space-y-space-xs max-w-md mx-auto">
                    <h3 className="font-headline-lg text-2xl text-primary font-semibold tracking-tight">
                      Thank you for reaching out
                    </h3>
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                      Your enquiry has been received safely. Aswathy will review your note
                      and respond to your email address within 24 to 48 hours.
                    </p>
                  </div>
                  <div className="pt-space-md flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="px-5 py-2.5 rounded-full border border-surface-container bg-surface hover:bg-surface-container text-xs font-medium text-primary transition-colors cursor-pointer"
                    >
                      Send Another Question
                    </button>
                    <a
                      href="/book-a-session#booking-form"
                      className="px-6 py-2.5 rounded-full bg-primary text-surface hover:bg-primary-container text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Book a Session Now →
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-space-md">
                  <div className="space-y-1 pb-1 border-b border-surface-container">
                    <h3 className="font-headline-sm text-xl text-primary font-semibold">
                      Send a Message
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      Feel free to share what brings you to counselling or any practical questions.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] text-xs font-medium animate-fadeIn">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    {/* Name */}
                    <div className="space-y-1">
                      <label
                        htmlFor="enquiry-name"
                        className="font-label-caps text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1"
                      >
                        <User className="w-3.5 h-3.5 text-secondary" />
                        <span>Your Full Name *</span>
                      </label>
                      <input
                        id="enquiry-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Priya Sharma"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface border border-parchment-border text-xs text-primary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label
                        htmlFor="enquiry-email"
                        className="font-label-caps text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5 text-secondary" />
                        <span>Email Address *</span>
                      </label>
                      <input
                        id="enquiry-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., priya@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface border border-parchment-border text-xs text-primary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    {/* Phone (Optional) */}
                    <div className="space-y-1">
                      <label
                        htmlFor="enquiry-phone"
                        className="font-label-caps text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-secondary" />
                        <span>Phone / WhatsApp (Optional)</span>
                      </label>
                      <input
                        id="enquiry-phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g., +91 755 000 2973"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface border border-parchment-border text-xs text-primary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-all"
                      />
                    </div>

                    {/* Subject / Area of Concern */}
                    <div className="space-y-1">
                      <label
                        htmlFor="enquiry-subject"
                        className="font-label-caps text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                        <span>Area of Inquiry</span>
                      </label>
                      <select
                        id="enquiry-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-surface border border-parchment-border text-xs text-primary focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-all"
                      >
                        <option value="General Consultation Inquiry">
                          General Practice &amp; Questions
                        </option>
                        <option value="Emotional Wellbeing & Stress">
                          Emotional Wellbeing &amp; Stress Management
                        </option>
                        <option value="Personal Growth & Self-Compassion">
                          Personal Concerns &amp; Self-Compassion
                        </option>
                        <option value="Relationships & Boundaries">
                          Relationships &amp; Interpersonal Dynamics
                        </option>
                        <option value="Student & Young Adult Support">
                          Student &amp; Young Adult Support
                        </option>
                        <option value="Life Challenges & Transitions">
                          Life Transitions &amp; Loss
                        </option>
                        <option value="Schedule or Modality Question">
                          Telehealth Schedule or Timing Question
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label
                      htmlFor="enquiry-message"
                      className="font-label-caps text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-secondary" />
                      <span>Your Message or Question *</span>
                    </label>
                    <textarea
                      id="enquiry-message"
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Share whatever is present for you. There is no need to write formally—a few lines about what you're seeking or wondering about is perfect."
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-parchment-border text-xs text-primary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-all leading-relaxed resize-y min-h-[100px]"
                    ></textarea>
                  </div>

                  {/* Submit button & security note */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-on-surface-variant/80 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-forest-green" />
                      <span>Encrypted, confidential inquiry transmission</span>
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-warm-umber text-surface hover:bg-earth-espresso font-label-md text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                    >
                      <span>{isSubmitting ? "Sending..." : "Submit Enquiry"}</span>
                      <Send className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
