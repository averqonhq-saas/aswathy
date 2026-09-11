"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, KeyRound } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import Modal from "@/components/admin/Modal";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirect = redirectParam?.startsWith("/admin")
    ? redirectParam
    : "/admin/dashboard";
  const { success, error, info } = useToast();

  const [email, setEmail] = useState("roottherapyonline@gmail.com");
  const [password, setPassword] = useState("admin12345");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        success(`Welcome back, ${data.admin.name}!`);
        router.push(redirect);
        router.refresh();
      } else {
        setErrorMessage(data.error || "Invalid credentials.");
        error(data.error || "Login failed");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        info(data.message || "Password reset instructions sent.");
        setForgotOpen(false);
      } else {
        error(data.error || "Unable to send reset instructions.");
      }
    } catch {
      error("An error occurred.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F2] text-[#1C1C18] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle organic sunlit background halo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-forest-green/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-surface rounded-3xl p-8 sm:p-10 border border-parchment-border shadow-[0_8px_30px_rgba(26,56,40,0.06)] relative z-10 animate-scaleUp">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-1.5 text-forest-green text-xs font-label-caps uppercase tracking-widest font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Private Practice Sanctuary</span>
          </div>
          <h1 className="font-headline-md text-2xl text-primary font-semibold tracking-tight">
            Psychologist Administration
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
            Welcome to your quiet management sanctuary. Access appointments, client enquiries, and website content.
          </p>
        </div>

        {/* Demo Credentials Quick Pill */}
        <div className="mb-6 p-3 rounded-2xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface-variant flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-forest-green shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-relaxed">
            <span className="font-semibold text-primary block">Default Login Credentials:</span>
            <span>Email: <strong className="text-forest-green">roottherapyonline@gmail.com</strong></span>
            <br />
            <span>Password: <strong className="text-forest-green">admin12345</strong></span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-[#FCE8E6] border border-[#FAD2CF] text-[#BA1A1A] text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="roottherapyonline@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-primary focus:outline-none focus:border-forest-green focus:bg-surface transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-primary focus:outline-none focus:border-forest-green focus:bg-surface transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-on-surface-variant cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-forest-green focus:ring-forest-green cursor-pointer accent-forest-green"
              />
              <span>Remember me (30 days)</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setForgotOpen(true);
              }}
              className="text-forest-green hover:underline font-medium text-xs cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-forest-green hover:bg-forest-green-hover text-white font-label-md text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enter Practice Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#F4D242] transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-surface-container text-center">
          <Link
            href="/"
            className="text-xs text-on-surface-variant hover:text-forest-green transition-colors inline-flex items-center gap-1"
          >
            <span>← Return to Public Website</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset Password"
        subtitle="We will assist you in restoring your admin access."
        maxWidth="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="px-4 py-2 rounded-full border border-surface-container-high text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotLoading || !forgotEmail}
              className="px-5 py-2 rounded-full bg-forest-green text-white text-xs font-semibold hover:bg-forest-green-hover shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {forgotLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        }
      >
        <form onSubmit={handleForgotPassword} className="space-y-4 py-1">
          <div className="p-3 rounded-2xl bg-[#FEF7E0] border border-[#FEEAA0] text-[#8D6B00] text-xs flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Enter your registered practitioner email address. A password reset procedure will be generated.
            </span>
          </div>

          <div className="space-y-1">
            <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="roottherapyonline@gmail.com"
              className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-primary focus:outline-none focus:border-forest-green focus:bg-surface"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FCF9F2] flex items-center justify-center p-4">
          <div className="w-8 h-8 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin"></div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
