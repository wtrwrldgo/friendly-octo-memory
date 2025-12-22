// file: app/firm-regions/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MapPin, Sparkles, Rocket, Globe, Zap } from "lucide-react";

export default function FirmRegionsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-8 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-60"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Animated Icon */}
        <div className="relative mb-8 inline-block">
          {/* Outer Ring Animation */}
          <div className="absolute inset-0 w-40 h-40 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-500/30 animate-spin" style={{ animationDuration: "20s" }} />
            <div className="absolute inset-2 rounded-full border-4 border-dashed border-purple-500/30 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
            <div className="absolute inset-4 rounded-full border-4 border-dashed border-emerald-500/30 animate-spin" style={{ animationDuration: "10s" }} />
          </div>

          {/* Main Icon Container */}
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl rotate-6 opacity-20 blur-xl animate-pulse" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 transform hover:scale-105 transition-transform duration-500">
              <MapPin className="w-16 h-16 text-white animate-bounce" style={{ animationDuration: "2s" }} />

              {/* Sparkle Effects */}
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-cyan-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
          </div>
        </div>

        {/* Title with Gradient */}
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
          Coming Soon
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 font-medium">
          Regions & Districts Management
        </p>

        {/* Description */}
        <p className="text-lg text-gray-500 dark:text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
          We&apos;re building something amazing! Soon you&apos;ll be able to manage your service areas,
          delivery zones, and coverage regions with powerful tools.
        </p>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Multi-Region Support</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage multiple cities and regions from one dashboard</p>
          </div>

          <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500" style={{ animationDelay: "0.1s" }}>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Dynamic Pricing</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Set custom delivery fees for each district</p>
          </div>

          <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500" style={{ animationDelay: "0.2s" }}>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smart Analytics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track performance across all your service areas</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span className="font-medium">Development Progress</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">75%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full animate-pulse relative"
              style={{ width: "75%" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Notify Button */}
        <div className="mt-12">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 overflow-hidden">
            <span className="relative z-10 flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              Notify Me When Ready
              <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
