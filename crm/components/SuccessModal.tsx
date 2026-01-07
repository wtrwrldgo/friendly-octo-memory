"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  X,
  Copy,
  Check,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  credentials?: {
    email: string;
    password: string;
  };
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  credentials,
}: SuccessModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string, type: "email" | "password") => {
    await navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: [
                  "#10B981",
                  "#3B82F6",
                  "#8B5CF6",
                  "#F59E0B",
                  "#EC4899",
                ][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
        style={{ animation: "successModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
        >
          <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Success Icon */}
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {message}
          </p>

          {/* Credentials Card */}
          {credentials && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 mb-6 text-left border border-slate-200/50 dark:border-slate-600/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Owner Credentials
                </span>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 dark:text-white font-medium truncate">
                      {credentials.email}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.email, "email")}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      copiedEmail
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-600">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 dark:text-white font-medium font-mono">
                      {credentials.password}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.password, "password")}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      copiedPassword
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {copiedPassword ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info Note */}
          {credentials && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Share these credentials with the firm owner to access their CRM dashboard.
            </p>
          )}

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes successModalIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -20px;
          animation: confettiFall 3s ease-out forwards;
        }

        .confetti-piece:nth-child(odd) {
          width: 8px;
          height: 16px;
          border-radius: 2px;
        }

        .confetti-piece:nth-child(even) {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
