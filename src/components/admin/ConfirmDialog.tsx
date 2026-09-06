"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: string;
  description?: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  description,
  confirmText,
  confirmLabel,
  cancelText = "Cancel",
  isDestructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleClose = onClose || onCancel || (() => {});
  const displayText = message || description || "";
  const displayConfirmText = confirmLabel || confirmText || "Confirm";
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-full border border-surface-container-high bg-surface hover:bg-surface-container text-on-surface-variant font-label-md text-xs font-medium transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-full font-label-md text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2 ${
              isDestructive
                ? "bg-[#BA1A1A] hover:bg-[#93000A] text-white"
                : "bg-forest-green hover:bg-forest-green-hover text-white"
            } disabled:opacity-50`}
          >
            {isLoading && (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{displayConfirmText}</span>
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isDestructive ? "bg-[#FCE8E6] text-[#BA1A1A]" : "bg-[#FEF7E0] text-[#8D6B00]"
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
          {displayText}
        </p>
      </div>
    </Modal>
  );
}
