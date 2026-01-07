// file: components/TrialExpiredPage.tsx

"use client";

import { AlertTriangle, Crown, Zap, Building } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const PLANS = [
  {
    name: "Basic",
    price: "Coming soon",
    description: "Perfect for small water delivery businesses",
    icon: Zap,
    features: [
      "Up to 100 orders/month",
      "1 branch",
      "3 staff members",
      "Basic analytics",
      "Email support",
    ],
    color: "bg-blue-600",
    coming: true,
  },
  {
    name: "Pro",
    price: "Coming soon",
    description: "For growing businesses with multiple branches",
    icon: Crown,
    features: [
      "Up to 500 orders/month",
      "5 branches",
      "10 staff members",
      "Advanced analytics",
      "Priority support",
      "Driver tracking",
    ],
    color: "bg-purple-600",
    coming: true,
    popular: true,
  },
  {
    name: "Max",
    price: "Coming soon",
    description: "For large enterprises with unlimited needs",
    icon: Building,
    features: [
      "Unlimited orders",
      "Unlimited branches",
      "Unlimited staff",
      "Custom analytics",
      "Dedicated support",
      "API access",
      "White-label options",
    ],
    color: "bg-gray-800",
    coming: true,
  },
];

export default function TrialExpiredPage() {
  const { firm, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">WaterGo</span>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Alert banner */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900 mb-1">
                  Your free trial has expired
                </h2>
                <p className="text-red-700">
                  {firm?.name ? `${firm.name}'s` : "Your"} 30-day free trial has ended.
                  To continue using WaterGo CRM and manage your water delivery business,
                  please subscribe to one of our plans below.
                </p>
              </div>
            </div>
          </div>

          {/* Plans heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Choose Your Plan
            </h1>
            <p className="text-gray-600 text-lg">
              Paid plans are coming soon. We will notify you when they become available.
            </p>
          </div>

          {/* Plans grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border ${
                  plan.popular ? "border-purple-300 ring-2 ring-purple-100" : "border-gray-200"
                } p-6 relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                  <plan.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-2xl font-bold text-gray-400">{plan.price}</span>
                </div>

                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-medium cursor-not-allowed mb-6"
                >
                  Coming Soon
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact section */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-2">
              Have questions or need enterprise solutions?
            </p>
            <a
              href="mailto:support@watergo.uz"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact our sales team
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t px-6 py-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} WaterGo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
