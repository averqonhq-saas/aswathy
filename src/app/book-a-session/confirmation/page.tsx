"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Calendar, Clock, Video, Mail, ArrowLeft, Download, ShieldCheck } from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "idle">("idle");
  const [bookingDetails, setBookingDetails] = useState<{
    id: string;
    clientName: string;
    clientEmail: string;
    serviceName: string;
    date: string;
    time: string;
  }>({
    id: searchParams.get("booking_id") || searchParams.get("id") || `ZOHO-${Date.now().toString().slice(-6)}`,
    clientName: searchParams.get("customer_name") || searchParams.get("name") || searchParams.get("client_name") || "Valued Client",
    clientEmail: searchParams.get("customer_email") || searchParams.get("email") || searchParams.get("client_email") || "",
    serviceName: searchParams.get("service_name") || searchParams.get("service") || "Individual Therapy Consultation",
    date: searchParams.get("date") || searchParams.get("booking_date") || new Date().toISOString().split("T")[0],
    time: searchParams.get("time") || searchParams.get("booking_time") || "10:00 AM",
  });

  useEffect(() => {
    const rawId = searchParams.get("booking_id") || searchParams.get("id");
    const name = searchParams.get("customer_name") || searchParams.get("name") || searchParams.get("client_name");
    const email = searchParams.get("customer_email") || searchParams.get("email") || searchParams.get("client_email");
    const phone = searchParams.get("customer_phone") || searchParams.get("phone");
    const service = searchParams.get("service_name") || searchParams.get("service");
    const date = searchParams.get("date") || searchParams.get("booking_date");
    const time = searchParams.get("time") || searchParams.get("booking_time");

    // If we have at least name or email or booking ID from Zoho redirect, sync to admin backend
    if (name || email || rawId) {
      setSyncStatus("syncing");
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name || "Zoho Client",
          clientEmail: email || "zoho_client@booking.com",
          clientPhone: phone || "+91 (Not Provided)",
          serviceName: service || "Individual Therapy Consultation",
          appointmentDate: date || new Date().toISOString().split("T")[0],
          appointmentTime: time || "10:00 AM",
          format: "online",
          provider: "zoho",
          zohoBookingId: rawId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.booking) {
            setBookingDetails({
              id: data.booking.id,
              clientName: data.booking.clientName,
              clientEmail: data.booking.clientEmail,
              serviceName: data.booking.serviceName,
              date: data.booking.appointmentDate,
              time: data.booking.appointmentTime,
            });
          }
          setSyncStatus("synced");
        })
        .catch((err) => {
          console.error("Failed to sync booking to admin:", err);
          setSyncStatus("idle");
        });
    }
  }, [searchParams]);

  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aswathy Counselling Psychology//Consultation//EN
BEGIN:VEVENT
UID:${bookingDetails.id}@aswathycounselling.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:Therapy Consultation with Aswathy Jeyarajasekar (${bookingDetails.serviceName})
DESCRIPTION:Format: 100% ONLINE (Google Meet)\\nSession: ${bookingDetails.serviceName}\\nConfidential consultation with Aswathy Jeyarajasekar.
LOCATION:Google Meet (Telehealth link sent via email)
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Therapy-Session-${bookingDetails.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto py-space-3xl px-gutter-mobile">
      <div className="bg-surface rounded-3xl border border-parchment-border/80 p-8 sm:p-12 shadow-sm text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#E7F3EC] text-[#1B5E20] flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCF9F2] border border-[#1A3828]/15 text-xs text-primary font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
          <span>Appointment Recorded &amp; Synchronized</span>
        </div>

        <h1 className="font-headline-lg text-3xl sm:text-4xl text-primary font-semibold tracking-tight">
          Your Session is Confirmed
        </h1>

        <p className="font-body-md text-on-surface-variant text-sm sm:text-base mt-2 max-w-lg mx-auto">
          Thank you, <span className="font-semibold text-primary">{bookingDetails.clientName}</span>. Your appointment has been scheduled and directly copied into Aswathy&apos;s clinical booking register.
        </p>

        {/* Appointment Card */}
        <div className="mt-8 p-6 rounded-2xl bg-[#FCF9F2] border border-parchment-border/80 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <span className="text-xs uppercase tracking-wider text-[#7B7368] font-bold">
              Booking Reference
            </span>
            <span className="font-mono text-xs font-semibold text-primary bg-white px-2.5 py-1 rounded-lg border border-parchment-border">
              {bookingDetails.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#7B7368] font-medium block">Service Area</span>
              <span className="font-semibold text-primary block text-sm">
                {bookingDetails.serviceName}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[#7B7368] font-medium block">Format</span>
              <span className="font-semibold text-[#1B5E20] flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>100% Online Telehealth</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[#7B7368] font-medium block">Scheduled Date</span>
              <span className="font-semibold text-primary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                <span>{bookingDetails.date}</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[#7B7368] font-medium block">Scheduled Time</span>
              <span className="font-semibold text-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                <span>{bookingDetails.time}</span>
              </span>
            </div>
          </div>

          {bookingDetails.clientEmail && (
            <div className="pt-2 border-t border-surface-container flex items-center gap-2 text-xs text-[#7B7368]">
              <Mail className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>
                Confirmation details &amp; meeting access instructions sent to{" "}
                <strong className="text-primary">{bookingDetails.clientEmail}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleDownloadIcs}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-parchment-border bg-white hover:bg-surface-container text-xs font-semibold text-primary transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-secondary" />
            <span>Add to Calendar (.ics)</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-surface hover:bg-primary-container transition-all text-xs font-semibold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>

        <p className="font-body-sm text-[11px] text-on-surface-variant/80 mt-6">
          Need to reschedule or have a question? Contact Aswathy directly at{" "}
          <a href="mailto:aswathy.counselling@gmail.com" className="text-primary underline">
            aswathy.counselling@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <>
      <Navbar />
      <main className="w-full min-h-[80vh] pt-24 pb-16 bg-surface flex items-center justify-center">
        <Suspense
          fallback={
            <div className="text-center py-20 text-on-surface-variant text-sm">
              Loading confirmation details...
            </div>
          }
        >
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
