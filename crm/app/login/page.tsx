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
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Water<span className="text-blue-400">Go</span>
          </h1>
          <p className="text-gray-500 mt-2">{t.auth.managementDashboard}</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1f26] rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">{t.auth.welcomeBack}</h2>
            <p className="text-gray-500 text-sm mt-1">{t.auth.signInToAccount}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder={t.auth.enterEmail}
                  className="w-full pl-11 pr-4 py-3 bg-[#0f1419] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder={t.auth.enterPassword}
                  className="w-full pl-11 pr-4 py-3 bg-[#0f1419] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
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
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-600 text-xs">{t.auth.testAccounts}</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Test Accounts */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setFormData({ email: "admin@watergo.com", password: "admin123" })}
              className="w-full p-3 bg-[#0f1419] hover:bg-[#1a2027] border border-gray-700 rounded-lg transition-colors text-left flex items-center justify-between"
            >
              <div>
                <p className="text-blue-400 text-sm font-medium">{t.auth.watergoAdmin}</p>
                <p className="text-gray-600 text-xs">admin@watergo.com</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>

            <button
              type="button"
              onClick={() => setFormData({ email: "owner@test.com", password: "password123" })}
              className="w-full p-3 bg-[#0f1419] hover:bg-[#1a2027] border border-gray-700 rounded-lg transition-colors text-left flex items-center justify-between"
            >
              <div>
                <p className="text-emerald-400 text-sm font-medium">{t.auth.firmOwnerAccount}</p>
                <p className="text-gray-600 text-xs">owner@test.com</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          {t.auth.copyright}
        </p>
      </div>
    </div>
  );
}
