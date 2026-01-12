// file: app/login/page.tsx

"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, Shield, Zap } from "lucide-react";
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
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.15)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.15)_0%,_transparent_50%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(34,197,94,0.08)_0%,_transparent_70%)]" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

      <div className="relative w-full max-w-md">
        {/* Logo - UNCHANGED */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            Water<span className="text-blue-400">Go</span>
          </h1>
          <p className="text-gray-400 mt-2">{t.auth.managementDashboard}</p>
        </div>

        {/* Login Card */}
        <div className="relative">
          {/* Card glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-[28px] blur-xl opacity-75" />

          <div className="relative bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Welcome header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{t.auth.secureLogin}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t.auth.welcomeBack}</h2>
              <p className="text-gray-400">{t.auth.signInToAccount}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <div className="p-2 rounded-xl bg-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-red-400 text-sm flex-1">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.auth.email}
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 p-1.5 rounded-lg bg-blue-500/10">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder={t.auth.enterEmail}
                      className="w-full pl-14 pr-4 py-4 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-transparent focus:ring-0 outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.auth.password}
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 p-1.5 rounded-lg bg-purple-500/10">
                      <Lock className="w-4 h-4 text-purple-400" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder={t.auth.enterPassword}
                      className="w-full pl-14 pr-4 py-4 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-transparent focus:ring-0 outline-none transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all duration-300 group-hover:blur-md" />
                <div className="relative w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-gray-500 text-xs font-medium">{t.auth.testAccounts}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Test Accounts */}
            <div className="grid grid-cols-2 gap-3">
              {/* Admin Account */}
              <button
                type="button"
                onClick={() => setFormData({ email: "admin@watergo.com", password: "admin123" })}
                className="group p-4 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-blue-500/20">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <ArrowRight className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </div>
                <p className="text-blue-400 font-semibold text-sm">{t.auth.watergoAdmin}</p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">admin@watergo.com</p>
              </button>

              {/* Firm Owner Account */}
              <button
                type="button"
                onClick={() => setFormData({ email: "owner@test.com", password: "password123" })}
                className="group p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </div>
                <p className="text-emerald-400 font-semibold text-sm">{t.auth.firmOwnerAccount}</p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">owner@test.com</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-8">
          {t.auth.copyright}
        </p>
      </div>
    </div>
  );
}
