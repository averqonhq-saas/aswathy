import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Lock,
  FileText,
  Eye,
  Server,
  UserCheck,
  AlertTriangle,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Aswathy Counselling Psychology",
  description:
    "Privacy Policy for Aswathy Counselling Psychology (Root Therapy). Learn how we protect your personal health information, confidential therapy session data, and privacy.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 18, 2026";

  return (
    <>
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
              <Shield className="w-3.5 h-3.5 text-secondary" />
              <span>Client Privacy &amp; Data Ethics</span>
            </div>
            <h1 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl text-primary font-semibold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-2xl">
              Your trust and privacy are the foundation of effective psychological care. This policy outlines how your personal information and consultation records are held with strict therapeutic confidentiality and integrity.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium">
              <span>Practice: <strong>Aswathy Counselling Psychology (Root Therapy)</strong></span>
              <span>•</span>
              <span>Practitioner: <strong>Aswathy Jeyarajasekar</strong></span>
              <span>•</span>
              <span>Last Revised: <strong>{lastUpdated}</strong></span>
            </div>
          </header>

          {/* Quick Summary Box */}
          <div className="mb-12 p-6 rounded-2xl bg-surface-container-low border border-parchment-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-secondary" />
              Core Confidentiality Pledge
            </h2>
            <p className="text-sm text-on-surface leading-relaxed">
              We adhere strictly to the professional ethical guidelines for clinical and counselling psychologists. All discussions, intake notes, and communication between you and Aswathy Jeyarajasekar remain completely private and confidential, protected by legal standards and psychological codes of ethics.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-10 text-on-surface leading-relaxed text-sm sm:text-base">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
                Information We Collect
              </h2>
              <p className="text-on-surface-variant">
                When you interact with our website, book an appointment, or contact our practice, we collect only information necessary to deliver quality psychological support:
              </p>
              <ul className="space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-1 shrink-0" />
                  <span><strong>Identification &amp; Contact Details:</strong> Full name, email address, phone/WhatsApp number, and location/city.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-1 shrink-0" />
                  <span><strong>Consultation Intake Information:</strong> Appointment date &amp; time, preferred format (Online Video via Google Meet or In-Person Clinic), service requested, and optional introductory notes or concerns you choose to share in the booking form.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-1 shrink-0" />
                  <span><strong>Payment Information:</strong> Transaction identifiers, payment timestamps, and amounts processed securely through Razorpay. <em>We never see, record, or store your credit/debit card numbers, UPI PINs, or net banking passwords.</em></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-1 shrink-0" />
                  <span><strong>Technical Logs:</strong> Standard HTTP request logs, browser type, and operating system for platform diagnostic and security monitoring.</span>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
                How We Use Your Information
              </h2>
              <p className="text-on-surface-variant">
                Your data is utilized solely for legitimate therapeutic and administrative purposes:
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  <span>To schedule, confirm, reschedule, or deliver your psychological counselling appointments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  <span>To auto-generate secure Google Meet video conference links and send Google Calendar invitations to your email.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  <span>To send transactional email receipts, appointment reminders, and therapeutic post-session resources.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  <span>To comply with professional standards and statutory health record-keeping requirements under applicable laws of India.</span>
                </li>
                <li className="flex items-start gap-2.5 text-primary font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                  <span>We will NEVER sell, rent, monetize, or disclose your personal details or therapy history to any third-party advertisers or marketing agencies.</span>
                </li>
              </ul>
            </section>

            {/* Section 3: Confidentiality & Statutory Limits */}
            <section className="space-y-3 p-6 rounded-2xl bg-amber-500/5 border border-amber-600/20">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <span>3. Therapeutic Confidentiality &amp; Legal Exceptions</span>
              </h2>
              <p className="text-on-surface text-sm sm:text-base leading-relaxed">
                Everything discussed within the therapeutic relationship is strictly confidential. However, in accordance with international psychological ethics codes, the Mental Healthcare Act, and the laws of India, therapeutic confidentiality is subject to specific statutory exceptions:
              </p>
              <div className="space-y-2 text-sm text-on-surface-variant">
                <div className="p-3 bg-surface rounded-xl border border-parchment-border">
                  <strong>1. Imminent Risk of Harm:</strong> If there is clear, credible evidence that a client intends to cause immediate severe physical harm or suicide to themselves, or grave harm to another identifiable individual.
                </div>
                <div className="p-3 bg-surface rounded-xl border border-parchment-border">
                  <strong>2. Protection of Minors / Vulnerable Persons:</strong> In cases involving suspected ongoing abuse, neglect, or endangerment of a minor child, elderly person, or incapacitated dependent.
                </div>
                <div className="p-3 bg-surface rounded-xl border border-parchment-border">
                  <strong>3. Judicial Mandates:</strong> Where disclosure is explicitly required by a formal court order or subpoena from a competent court of law.
                </div>
              </div>
              <p className="text-xs text-on-surface-variant italic pt-1">
                *In any such rare event, reasonable efforts will be made to discuss the required disclosure with the client prior to contacting designated emergency contacts or relevant medical authorities.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">4</span>
                Third-Party Platforms &amp; Security Infrastructure
              </h2>
              <p className="text-on-surface-variant">
                To provide a reliable tele-mental health experience, we utilize reputable, industry-standard service providers who comply with high privacy standards:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-parchment-border bg-surface-container-lowest">
                  <h3 className="font-semibold text-primary text-sm mb-1 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-secondary" /> Razorpay Payment Gateway
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    PCI-DSS Level 1 compliant gateway. Card details and banking credentials are handled through secure end-to-end encryption.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-parchment-border bg-surface-container-lowest">
                  <h3 className="font-semibold text-primary text-sm mb-1 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-secondary" /> Google Calendar &amp; Meet
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Video consultation rooms are generated using Google Meet with encrypted audio/video streams in transit and authenticated access.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-parchment-border bg-surface-container-lowest">
                  <h3 className="font-semibold text-primary text-sm mb-1 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-secondary" /> Supabase Database
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Encrypted PostgreSQL database hosted with SSL in transit and AES-256 encryption at rest for booking records.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-parchment-border bg-surface-container-lowest">
                  <h3 className="font-semibold text-primary text-sm mb-1 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-secondary" /> Gmail SMTP (Google Workspace)
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Transactional appointment confirmations and updates delivered over TLS-encrypted mail channels.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">5</span>
                Data Retention &amp; Security Controls
              </h2>
              <p className="text-on-surface-variant">
                We implement administrative, technical, and physical safeguards designed to prevent unauthorized access, accidental alteration, or disclosure of your information:
              </p>
              <ul className="space-y-1.5 pl-2 text-on-surface-variant text-sm">
                <li>• Clinical intake notes are stored separately from general booking records on encrypted, password-protected offline/private drives.</li>
                <li>• Records are retained for the duration mandated by psychological professional regulations (typically 3 to 7 years following the conclusion of care), after which they are securely scrubbed.</li>
                <li>• All web traffic is strictly served over modern HTTPS with TLS 1.3 encryption.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">6</span>
                Your Privacy Rights
              </h2>
              <p className="text-on-surface-variant">
                As a client, you maintain the following rights regarding your personal data:
              </p>
              <ul className="space-y-2 pl-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                  <span><strong>Right to Access:</strong> You may request a summary of personal information we hold about you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                  <span><strong>Right to Correction:</strong> You may request corrections to any inaccurate contact information or personal details.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                  <span><strong>Right to Erasure:</strong> You may request deletion of non-mandatory administrative records, subject to professional clinical record-keeping statutes.</span>
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-semibold flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">7</span>
                Cookies &amp; Analytics
              </h2>
              <p className="text-on-surface-variant text-sm sm:text-base">
                Our website utilizes only essential technical session cookies required for appointment booking workflows and CSRF security. We do not use third-party behavioral profiling trackers, cross-site advertising pixels, or data brokers.
              </p>
            </section>

            {/* Section 8: Contact */}
            <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-parchment-border space-y-4">
              <h2 className="font-headline-md text-xl text-primary font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-secondary" />
                Contact the Privacy &amp; Grievance Officer
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                If you have questions regarding this Privacy Policy, wish to exercise your data rights, or want clarification regarding session confidentiality, please direct your inquiry to:
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
              <p className="text-xs text-on-surface-variant pt-2">
                Postal Address: Aswathy Counselling Psychology (Root Therapy), Tamil Nadu, India.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
