// file: app/login/page.tsx

"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError, user } = await signIn(formData.email, formData.password);

      if (signInError) {
        setError(signInError.message || t.auth.invalidCredentials);
        setLoading(false);
        return;
      }

      const redirectTo = user?.role === "WATERGO_ADMIN" ? "/" : "/firm-dashboard";
      window.location.href = redirectTo;
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || t.auth.loginFailed);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1633] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white">
            Water<span className="text-blue-400">Go</span>
          </h1>
          <p className="text-gray-400 mt-2">{t.auth.managementDashboard}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{t.auth.welcomeBack}</h2>
            <p className="text-gray-400">{t.auth.signInToAccount}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl relative z-50">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.auth.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  placeholder={t.auth.enterEmail}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.auth.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  placeholder={t.auth.enterPassword}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t.auth.signingIn}</span>
                </>
              ) : (
                <>
                  <span>{t.auth.signIn}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-sm">{t.auth.testAccounts}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Test Accounts */}
          <div className="space-y-3">
            {/* Admin Account */}
            <button
              type="button"
              onClick={() => setFormData({ email: "admin@watergo.com", password: "admin123" })}
              className="w-full p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 font-semibold text-sm">{t.auth.watergoAdmin}</p>
                  <p className="text-gray-500 text-xs mt-1">admin@watergo.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Firm Owner Account */}
            <button
              type="button"
              onClick={() => setFormData({ email: "owner@test.com", password: "password123" })}
              className="w-full p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-400 font-semibold text-sm">{t.auth.firmOwnerAccount}</p>
                  <p className="text-gray-500 text-xs mt-1">owner@test.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          {t.auth.copyright}
        </p>
      </div>
    </div>
  );
}
