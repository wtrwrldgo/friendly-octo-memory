"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Loader2,
  X,
  Trash2,
  ShieldAlert,
} from "lucide-react";

export type ConfirmModalVariant = "danger" | "warning" | "info" | "success";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  loading?: boolean;
  itemName?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading: externalLoading,
  itemName,
}: ConfirmModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loading = externalLoading ?? internalLoading;

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Small delay for mount animation
      requestAnimationFrame(() => setShowModal(true));
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (loading) return;
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      onClose();
    }, 200);
  };

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
      setIsClosing(true);
      setTimeout(() => {
        setShowModal(false);
        onClose();
      }, 200);
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: Trash2,
      iconColor: "text-red-500",
      gradient: "from-red-500 to-rose-600",
      bgGradient: "from-red-500/10 to-rose-500/5",
      confirmButton: "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/25",
      orbColor: "from-red-500/10 to-rose-500/10",
      glowColor: "bg-red-500/20",
      warningBg: "bg-red-50 dark:bg-red-900/20",
      warningBorder: "border-red-200 dark:border-red-800/50",
      warningText: "text-red-600 dark:text-red-400",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/10 to-orange-500/5",
      confirmButton: "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25",
      orbColor: "from-amber-500/10 to-orange-500/10",
      glowColor: "bg-amber-500/20",
      warningBg: "bg-amber-50 dark:bg-amber-900/20",
      warningBorder: "border-amber-200 dark:border-amber-800/50",
      warningText: "text-amber-600 dark:text-amber-400",
    },
    info: {
      icon: ShieldAlert,
      iconColor: "text-blue-500",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-500/10 to-indigo-500/5",
      confirmButton: "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25",
      orbColor: "from-blue-500/10 to-indigo-500/10",
      glowColor: "bg-blue-500/20",
      warningBg: "bg-blue-50 dark:bg-blue-900/20",
      warningBorder: "border-blue-200 dark:border-blue-800/50",
      warningText: "text-blue-600 dark:text-blue-400",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-emerald-500",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/10 to-teal-500/5",
      confirmButton: "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25",
      orbColor: "from-emerald-500/10 to-teal-500/10",
      glowColor: "bg-emerald-500/20",
      warningBg: "bg-emerald-50 dark:bg-emerald-900/20",
      warningBorder: "border-emerald-200 dark:border-emerald-800/50",
      warningText: "text-emerald-600 dark:text-emerald-400",
    },
  };

  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${styles.glowColor} opacity-60`}
            style={{
              left: `${15 + i * 10}%`,
              top: `${25 + (i % 4) * 15}%`,
              animation: `float ${3 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 ${
          isClosing
            ? "opacity-0 scale-90 translate-y-8"
            : showModal
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-8"
        }`}
        style={{
          animation: showModal && !isClosing ? "confirmModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
        }}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.orbColor} pointer-events-none`} />

        {/* Decorative orbs */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 ${styles.glowColor} rounded-full blur-3xl pointer-events-none animate-pulse`} />
        <div className={`absolute -bottom-24 -left-24 w-48 h-48 ${styles.glowColor} rounded-full blur-3xl pointer-events-none animate-pulse`} style={{ animationDelay: "1s" }} />

        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90 z-10 disabled:opacity-50"
        >
          <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Icon with effects */}
          <div className="relative mx-auto mb-6 w-24 h-24">
            {/* Pulse ring */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${styles.gradient} opacity-20 animate-ping`} style={{ animationDuration: "2s" }} />
            {/* Rotating border */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 animate-spin" style={{ animationDuration: "10s" }} />
            {/* Glow */}
            <div className={`absolute inset-2 rounded-full ${styles.glowColor} blur-xl animate-pulse`} />
            {/* Icon container */}
            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${styles.bgGradient} border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center`}>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center shadow-lg transform transition-transform hover:scale-105`}>
                <IconComponent className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            {message}
          </p>

          {/* Item name highlight */}
          {itemName && (
            <div className="mb-5 px-5 py-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 inline-block max-w-full">
              <p className="text-slate-900 dark:text-white font-semibold truncate">
                &ldquo;{itemName}&rdquo;
              </p>
            </div>
          )}

          {/* Warning note for danger variant */}
          {variant === "danger" && (
            <div className={`mb-6 p-4 ${styles.warningBg} border ${styles.warningBorder} rounded-xl`}>
              <p className={`text-sm ${styles.warningText} flex items-center justify-center gap-2`}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>This action cannot be undone</span>
              </p>
            </div>
          )}

          {!itemName && variant !== "danger" && <div className="mb-6" />}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="group-hover:scale-105 inline-block transition-transform">
                {cancelText}
              </span>
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-6 py-4 bg-gradient-to-r ${styles.confirmButton} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confirmModalIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          50% {
            transform: scale(1.02) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-25px) scale(1.3);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
