// file: components/TrialExpiredOverlay.tsx

"use client";

import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, CreditCard, Sparkles, Check, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Basic",
    price: "99,000",
    period: "month",
    features: [
      "Up to 100 orders/month",
      "Up to 5 drivers",
      "Basic analytics",
      "Email support",
    ],
    recommended: false,
  },
  {
    name: "Pro",
    price: "199,000",
    period: "month",
    features: [
      "Up to 500 orders/month",
      "Up to 15 drivers",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
    recommended: true,
  },
  {
    name: "Max",
    price: "399,000",
    period: "month",
    features: [
      "Unlimited orders",
      "Unlimited drivers",
      "Full analytics suite",
      "24/7 phone support",
      "Custom integrations",
      "Dedicated manager",
    ],
    recommended: false,
  },
];

export default function TrialExpiredOverlay() {
  const { subscription, loading } = useSubscription();
  const { isWatergoAdmin, firm } = useAuth();

  // Don't show for WaterGo admin
  if (isWatergoAdmin) return null;

  // Don't show while loading
  if (loading) return null;

  // Don't show if subscription is active
  if (!subscription?.isTrialExpired) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Your Free Trial Has Expired
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Your 30-day free trial for <span className="text-white font-semibold">{firm?.name || "your firm"}</span> has ended.
            Choose a plan to continue using WaterGo CRM.
          </p>
          {/* Reassuring message */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              Your data is safe. Activate a plan to continue without interruption.
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-gray-800 rounded-2xl p-6 border-2 transition-all ${
                plan.recommended
                  ? "border-blue-500 shadow-xl shadow-blue-500/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">UZS/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.recommended
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Need help choosing a plan? Contact our sales team.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="mailto:support@watergo.uz"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Contact Sales
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              View detailed pricing
            </Link>
          </div>
        </div>

        {/* Trial Info */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            Trial started: {subscription?.trialStartAt ? new Date(subscription.trialStartAt).toLocaleDateString() : "—"} |
            Trial ended: {subscription?.trialEndAt ? new Date(subscription.trialEndAt).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
