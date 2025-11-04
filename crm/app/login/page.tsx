// file: app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { signIn } = useAuth();
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
      // Use Supabase authentication
      const { error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        setError(signInError.message || "Invalid email or password");
        return;
      }

      // Redirect will be handled by AuthContext
      router.push("/firm-dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-400/30'}`}></div>
        <div className={`absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-400/30'}`}></div>
        <div className={`absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 ${theme === 'dark' ? 'bg-pink-600/20' : 'bg-pink-400/30'}`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-[1000px]">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Droplets className="w-12 h-12 text-blue-500" />
              <h1 className="text-3xl font-bold">
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Water</span>
                <span className="text-blue-500">Go</span>
              </h1>
            </div>
          </div>

          {/* Login Card */}
          <div className={`backdrop-blur-xl border rounded-3xl p-1 shadow-2xl ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/60 border-white/40'}`}>
            <div className={`backdrop-blur-2xl rounded-3xl p-8 md:p-12 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900/90 to-gray-900/50' : 'bg-white/80'}`}>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left - Info */}
                <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    Welcome to the future of delivery
                  </h2>
                  <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Powerful analytics, real-time tracking, and seamless management
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold">Real-time tracking</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monitor every delivery instantly</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold">Advanced analytics</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Data-driven insights for growth</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold">Easy management</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Simple, intuitive interface</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right - Form */}
                <div>
                  <div className="mb-8">
                    <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sign in</h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Access your account</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-4 backdrop-blur-xl border border-red-500/50 rounded-xl bg-red-500/10">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Email address"
                        className={`w-full px-4 py-4 backdrop-blur-xl border rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                          theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                            : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        required
                        placeholder="Password"
                        className={`w-full px-4 py-4 backdrop-blur-xl border rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                          theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                            : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        "Sign in"
                      )}
                    </button>
                  </form>

                  {/* Demo Credentials */}
                  <div className={`mt-6 p-4 backdrop-blur-xl border rounded-xl ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-gray-200'}`}>
                    <p className={`text-xs font-semibold uppercase mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Test Account</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Email</span>
                        <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'text-gray-300 bg-white/5' : 'text-gray-700 bg-white/60'}`}>owner@aquapure.uz</code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Password</span>
                        <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'text-gray-300 bg-white/5' : 'text-gray-700 bg-white/60'}`}>TestPassword123!</code>
                      </div>
                      <p className={`text-center mt-3 text-yellow-500 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ⚠ Complete database setup first (see QUICKSTART.md)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
            © 2024 <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Water</span><span className="text-blue-500">Go</span>. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
