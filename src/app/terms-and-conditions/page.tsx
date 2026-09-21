import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  AlertOctagon,
  Calendar,
  CreditCard,
  Video,
  ShieldCheck,
  Scale,
  RefreshCw,
  Mail,
  Phone,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Terms of Service & Consultation Policy | Aswathy Counselling Psychology",
  description:
    "Consultation guidelines, confidentiality limits, appointment rescheduling, and cancellation terms for Aswathy Counselling Psychology practice.",
  alternates: {
    canonical: "https://www.aswathypsychologist.com/terms-and-conditions",
  },
  openGraph: {
    title: "Terms of Service & Consultation Policy | Aswathy Counselling Psychology",
    description:
      "Clear consultation guidelines and ethical framework for counselling sessions with Aswathy Jeyarajasekar.",
    url: "https://www.aswathypsychologist.com/terms-and-conditions",
    siteName: "Aswathy Jeyarajasekar Counselling Psychology",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms & Conditions | Aswathy Counselling Psychology",
    description:
      "Consultation guidelines and cancellation terms for psychological counselling appointments.",
  },
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "September 18, 2026";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.aswathypsychologist.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Terms & Conditions",
        item: "https://www.aswathypsychologist.com/terms-and-conditions",
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <Navbar />
      <main className="w-full pt-28 lg:pt-32 pb-20 bg-surface min-h-screen">
        <div className="max-w-4xl mx-auto px-gutter-mobile lg:px-gutter-desktop">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Header Banner */}
          <header className="mb-12 pb-8 border-b border-parchment-border">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed text-xs font-semibold uppercase tracking-wider mb-4">
              <FileText className="w-3.5 h-3.5 text-secondary" />
              <span>Client Agreement &amp; Practice Policies</span>
            </div>
            <h1 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl text-primary font-semibold tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="mt-4 text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-2xl">
              Welcome to Aswathy Counselling Psychology (Root Therapy). These terms establish a transparent, respectful, and safe therapeutic boundary for all psychological consultations and digital services.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium">
              <span>Practice: <strong>Aswathy Counselling Psychology (Root Therapy)</strong></span>
              <span>•</span>
              <span>Practitioner: <strong>Aswathy Jeyarajasekar</strong></span>
              <span>•</span>
              <span>Last Revised: <strong>{lastUpdated}</strong></span>
            </div>
          </header>

          {/* CRITICAL CRISIS NOTICE BOX */}
          <div className="mb-12 p-6 sm:p-7 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950">
            <div className="flex items-start gap-3.5">
              <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h2 className="font-headline-md text-lg sm:text-xl font-bold text-rose-900">
                  Not an Emergency or Acute Crisis Service
                </h2>
                <p className="text-sm leading-relaxed text-rose-900/90">
                  Aswathy Counselling Psychology is an outpatient private practice offering scheduled psychological consultations. <strong>We do not provide 24/7 psychiatric emergency, walk-in crisis, or suicide intervention services.</strong>
                </p>
                <div className="pt-2 text-xs sm:text-sm text-rose-950 font-medium">
                  If you are in acute crisis, experiencing thoughts of self-harm, suicide, or psychiatric emergency, please immediately contact:
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <span className="p-2 rounded-lg bg-white/80 border border-rose-200">
                      📞 <strong>Tele-MANAS (Govt of India):</strong> 14416 or 1800-891-4416 (24/7 Free)
                    </span>
                    <span className="p-2 rounded-lg bg-white/80 border border-rose-200">
                      📞 <strong>Vandrevala Foundation Helpline:</strong> +91 9999 666 555 (24/7 Free)
                    </span>
                    <span className="p-2 rounded-lg bg-white/80 border border-rose-200">
                      📞 <strong>Kiran Mental Health Helpline:</strong> 1800-599-0019 (24/7)
                    </span>
                    <span className="p-2 rounded-lg bg-white/80 border border-rose-200">
                      🏥 Or visit the nearest hospital emergency department.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Sections */}
          <div className="space-y-10 text-on-surface leading-relaxed text-sm sm:text-base">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
                Acceptance of Agreement
              </h2>
              <p className="text-on-surface-variant">
                By booking a session, submitting payment via Razorpay, or utilizing this website, you acknowledge that you have read, understood, and agreed to be bound by these Terms &amp; Conditions and our <Link href="/privacy-policy" className="text-primary font-semibold underline underline-offset-4 hover:text-secondary">Privacy Policy</Link>. If you do not agree with any part of these terms, please do not book a session.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
                Nature of Psychological Services
              </h2>
              <p className="text-on-surface-variant">
                Services provided by Aswathy Jeyarajasekar consist of professional psychological counselling, psycho-education, relational therapy, and evidence-based mental health support.
              </p>
              <ul className="space-y-2 pl-2 text-sm text-on-surface-variant">
                <li>• <strong>No Psychiatric Prescriptions:</strong> Psychological counselling does not include prescribing psychiatric medications (e.g. antidepressants, mood stabilizers). If medical intervention is deemed helpful, appropriate referral recommendations to a qualified psychiatrist will be discussed.</li>
                <li>• <strong>No Forensic or Legal Certifications:</strong> Consultations are intended strictly for clinical well-being and personal psychological growth. Sessions and notes are not provided for court litigation, child custody disputes, disability certificates, or legal fitness claims unless mandated by a court subpoena.</li>
                <li>• <strong>Client Autonomy:</strong> Therapy is a collaborative process. While the therapist offers guidance and therapeutic frameworks, decisions regarding your life, relationships, and health remain your personal responsibility.</li>
              </ul>
            </section>

            {/* Section 3: Tele-Mental Health & Technical Requirements */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <Video className="w-5 h-5 text-secondary" />
                <span>3. Online Consultations via Google Meet</span>
              </h2>
              <p className="text-on-surface-variant">
                For online telehealth consultations, a dedicated Google Meet link is automatically created and sent to your email upon booking confirmation.
              </p>
              <div className="p-4 rounded-xl bg-surface-container-low border border-parchment-border space-y-2 text-sm text-on-surface">
                <p><strong>Client Responsibilities during Online Sessions:</strong></p>
                <ul className="space-y-1.5 pl-2 text-on-surface-variant">
                  <li>• <strong>Privacy &amp; Safety:</strong> You must join from a private, quiet, and confidential physical space free from interruptions or third-party presence.</li>
                  <li>• <strong>Punctuality:</strong> Sessions begin promptly at the scheduled time and conclude after the allocated duration (50 minutes). If you join late, the session will still conclude at the original end time to respect subsequent clients.</li>
                  <li>• <strong>Technology:</strong> You are responsible for ensuring adequate device battery, a functioning webcam, microphone, and a stable broadband internet connection.</li>
                </ul>
              </div>
            </section>

            {/* Section 4: Strict Recording Prohibition */}
            <section className="space-y-3 p-6 rounded-2xl bg-surface-container-low border border-parchment-border">
              <h2 className="font-headline-md text-xl text-primary font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span>4. Strict Prohibition of Audio/Video Recording</span>
              </h2>
              <p className="text-sm text-on-surface leading-relaxed">
                To protect mutual trust, psychological safety, and statutory privacy rights, <strong>neither the client nor the practitioner may record audio, video, or take screenshots of any therapy session without explicit, prior written mutual consent</strong>. Any unauthorized recording or distribution is a direct breach of confidentiality and applicable data protection laws.
              </p>
            </section>

            {/* Section 5: Booking, Fees & Payment Terms */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-secondary" />
                <span>5. Booking Fees &amp; Payment Terms</span>
              </h2>
              <ul className="space-y-2 pl-2 text-sm text-on-surface-variant">
                <li>• <strong>Advance Confirmation:</strong> Appointment slots are exclusively confirmed upon successful receipt of the consultation fee via Razorpay.</li>
                <li>• <strong>Currency &amp; Taxes:</strong> All stated fees are in Indian Rupees (₹ INR) and include applicable taxes unless specifically stated otherwise.</li>
                <li>• <strong>Secure Gateway:</strong> Payments are processed via Razorpay. Root Therapy does not retain payment credentials, card numbers, or bank account authentication keys.</li>
              </ul>
            </section>

            {/* Section 6: Cancellation, Rescheduling & Refund Policy */}
            <section className="space-y-4 p-6 sm:p-7 rounded-2xl bg-[#faf7f0] border border-parchment-border">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <RefreshCw className="w-5 h-5 text-secondary" />
                <span>6. Rescheduling, Cancellation &amp; Refund Policy</span>
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Therapists reserve dedicated time exclusively for you. When a session is cancelled on short notice, that reserved therapeutic hour cannot be provided to another individual who may be waiting for care. Please adhere to the following policy:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Rescheduling */}
                <div className="p-4 rounded-xl bg-surface border border-parchment-border">
                  <h3 className="font-semibold text-primary text-sm mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-secondary" /> Rescheduling Policy
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    You may reschedule your session at no additional cost if notice is provided <strong>at least 24 hours prior</strong> to the scheduled appointment time. To reschedule, contact us via email or WhatsApp.
                  </p>
                </div>

                {/* Cancellations & Refunds */}
                <div className="p-4 rounded-xl bg-surface border border-parchment-border">
                  <h3 className="font-semibold text-primary text-sm mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-secondary" /> Cancellation &amp; Refunds
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Cancellations made <strong>24+ hours in advance</strong> are eligible for a full refund (minus standard payment gateway processing fees) or full session credit.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-surface-container-high/60 rounded-xl text-xs sm:text-sm text-on-surface space-y-1.5">
                <p><strong>Late Cancellations &amp; No-Shows:</strong></p>
                <p className="text-on-surface-variant">
                  Cancellations requested with less than 24 hours notice or non-attendance (&ldquo;no-show&rdquo;) without prior notification are non-refundable, as the time was reserved solely for you.
                </p>
                <p className="text-on-surface-variant pt-1">
                  <strong>Practitioner Cancellation Guarantee:</strong> In the unforeseen event that the psychologist must reschedule or cancel due to an emergency or illness, you will be offered immediate priority rescheduling or a 100% full refund immediately.
                </p>
              </div>
            </section>

            {/* Section 7: Code of Conduct */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">7</span>
                Code of Conduct &amp; Zero Harassment
              </h2>
              <p className="text-on-surface-variant text-sm sm:text-base">
                The therapeutic relationship is built on reciprocal respect and emotional safety. We maintain a zero-tolerance policy against:
              </p>
              <ul className="space-y-1.5 pl-2 text-sm text-on-surface-variant">
                <li>• Verbal abuse, intimidation, hostility, or harassment directed at the psychologist or support team.</li>
                <li>• Attending sessions under the acute influence of illicit recreational drugs or alcohol.</li>
                <li>• Any inappropriate sexualized remarks or non-consensual conduct.</li>
              </ul>
              <p className="text-xs text-on-surface-variant italic">
                In the event of unacceptable conduct, the psychologist reserves the right to immediately terminate the session without refund and recommend external institutional care.
              </p>
            </section>

            {/* Section 8: Intellectual Property */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">8</span>
                Intellectual Property
              </h2>
              <p className="text-on-surface-variant text-sm">
                All psychoeducational articles, therapeutic worksheets, mindfulness audio, website copy, visual designs, and brand trademarks are the intellectual property of Aswathy Counselling Psychology and Averqon. You may not reproduce, resell, or distribute these materials without written authorization.
              </p>
            </section>

            {/* Section 9: Governing Law */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-secondary" />
                <span>9. Governing Law &amp; Jurisdiction</span>
              </h2>
              <p className="text-on-surface-variant text-sm">
                These Terms &amp; Conditions and any dispute or claim arising out of therapeutic services or website use shall be governed by and construed in accordance with the laws of India. The courts of Tamil Nadu, India shall have exclusive jurisdiction over any legal proceedings.
              </p>
            </section>

            {/* Section 10: Inquiries & Contact */}
            <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-parchment-border space-y-4">
              <h2 className="font-headline-md text-xl text-primary font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-secondary" />
                Questions Regarding Terms &amp; Policies?
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                If you need clarification regarding any aspect of our therapeutic framework, cancellation policies, or scheduling agreements, we welcome your inquiries:
              </p>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                <a
                  href="mailto:roottherapyonline@gmail.com"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-medium transition-colors"
                >
                  <Mail className="w-4 h-4 text-secondary" />
                  <span>roottherapyonline@gmail.com</span>
                </a>
                <a
                  href="tel:+917550002973"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-medium transition-colors"
                >
                  <Phone className="w-4 h-4 text-secondary" />
                  <span>+91 755 000 2973</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
