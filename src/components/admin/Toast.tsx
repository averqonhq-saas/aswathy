"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "success", title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type, title }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => addToast(message, "success", title),
    [addToast]
  );
  const error = useCallback(
    (message: string, title?: string) => addToast(message, "error", title),
    [addToast]
  );
  const info = useCallback(
    (message: string, title?: string) => addToast(message, "info", title),
    [addToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => addToast(message, "warning", title),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all animate-fadeIn ${
              t.type === "success"
                ? "bg-[#FCF9F2]/95 border-[#C8E6C9] text-[#1A3828]"
                : t.type === "error"
                ? "bg-[#FCF9F2]/95 border-[#FAD2CF] text-[#93000A]"
                : t.type === "warning"
                ? "bg-[#FCF9F2]/95 border-[#FEEAA0] text-[#705D00]"
                : "bg-[#FCF9F2]/95 border-parchment-border text-[#412A1E]"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-[#2D523E]" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-5 h-5 text-[#BA1A1A]" />
              )}
              {t.type === "warning" && (
                <AlertCircle className="w-5 h-5 text-[#705D00]" />
              )}
              {t.type === "info" && <Info className="w-5 h-5 text-[#4A3328]" />}
            </div>

            <div className="flex-1 text-xs">
              {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
              <div className="opacity-90 leading-relaxed">{t.message}</div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
