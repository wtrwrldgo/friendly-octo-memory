"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X, Sparkles } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    bgGlow: "shadow-emerald-500/50",
    iconBg: "bg-white/20",
    progressBar: "bg-white/40",
  },
  error: {
    icon: XCircle,
    gradient: "from-red-500 via-rose-500 to-pink-500",
    bgGlow: "shadow-red-500/50",
    iconBg: "bg-white/20",
    progressBar: "bg-white/40",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    bgGlow: "shadow-amber-500/50",
    iconBg: "bg-white/20",
    progressBar: "bg-white/40",
  },
  info: {
    icon: Info,
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    bgGlow: "shadow-blue-500/50",
    iconBg: "bg-white/20",
    progressBar: "bg-white/40",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration || 4000;

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Progress bar animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    // Auto-dismiss
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 400);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [toast.id, duration, onRemove]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 400);
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl shadow-2xl ${config.bgGlow}
        transform transition-all duration-400 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"}
        backdrop-blur-xl
      `}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-95`} />

      {/* Animated glow effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Sparkle effects */}
      <div className="absolute top-2 right-12 opacity-60">
        <Sparkles className="w-3 h-3 text-white animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative flex items-center gap-4 px-5 py-4 min-w-[320px] max-w-[420px]">
        {/* Icon with glow */}
        <div className={`flex-shrink-0 p-2.5 rounded-xl ${config.iconBg} backdrop-blur-sm`}>
          <Icon className="w-5 h-5 text-white drop-shadow-lg" />
        </div>

        {/* Message */}
        <p className="flex-1 text-white font-semibold text-sm leading-tight drop-shadow-md pr-6">
          {toast.message}
        </p>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all hover:scale-110 group"
        >
          <X className="w-3.5 h-3.5 text-white/80 group-hover:text-white" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
        <div
          className={`h-full ${config.progressBar} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    showToast("success", message, duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast("error", message, duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast("warning", message, duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast("info", message, duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Toast container - fixed position top-right with highest z-index */}
      <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
