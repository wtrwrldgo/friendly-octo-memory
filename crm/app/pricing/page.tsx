// file: app/pricing/page.tsx

"use client";

import { Crown, Zap, Building, ArrowLeft, Check, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

// WaterGo logo URL from backend static files
const WATERGO_LOGO_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL
  ? `${process.env.NEXT_PUBLIC_LOCAL_API_URL.replace('/api', '')}/static/firms/watergo-logo.png`
  : "http://localhost:3001/static/firms/watergo-logo.png";

const PLANS = [
  {
    id: "BASIC" as const,
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
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    coming: true,
  },
  {
    id: "PRO" as const,
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
    borderColor: "border-purple-300",
    bgColor: "bg-purple-50",
    coming: true,
    popular: true,
  },
  {
    id: "MAX" as const,
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
    borderColor: "border-gray-300",
    bgColor: "bg-gray-50",
    coming: true,
  },
];

export default function PricingPage() {
  const { subscription } = useSubscription();
  const { profile, firm } = useAuth();
  const { t } = useLanguage();
  const [logoError, setLogoError] = useState(false);

  // Determine back link based on user role
  const backLink = profile?.role === "OWNER" ? "/" : "/firm-dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href={backLink}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            {t.pricing.backToDashboard}
          </Link>

          {subscription?.status === "TRIAL_ACTIVE" && subscription.daysRemaining !== null && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{subscription.daysRemaining}</span> {t.pricing.daysRemaining}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t.pricing.chooseYourPlan}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.pricing.scaleYourBusiness}
            </p>
          </div>

          {/* Current subscription status card */}
          {subscription && (
            <div className={`rounded-2xl border-2 p-8 mb-10 ${
              subscription.status === "TRIAL_EXPIRED"
                ? "bg-red-50 border-red-200"
                : subscription.status === "TRIAL_ACTIVE"
                ? "bg-blue-50 border-blue-200"
                : "bg-green-50 border-green-200"
            }`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Firm icon and Status info */}
                <div className="flex items-center gap-4">
                  {/* Firm Logo */}
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden ${
                      subscription.status === "TRIAL_EXPIRED"
                        ? "bg-red-100"
                        : subscription.status === "TRIAL_ACTIVE"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                        : "bg-gradient-to-br from-green-500 to-emerald-600"
                    }`}>
                      {/* Show WaterGo logo for WATERGO_ADMIN, or firm logo for regular firms */}
                      {(profile?.role === "WATERGO_ADMIN" || firm?.logoUrl) && !logoError ? (
                        <Image
                          src={profile?.role === "WATERGO_ADMIN" ? WATERGO_LOGO_URL : firm?.logoUrl || ""}
                          alt={profile?.role === "WATERGO_ADMIN" ? "WaterGo" : (firm?.name || "Firm logo")}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={() => setLogoError(true)}
                          unoptimized
                        />
                      ) : subscription.status === "TRIAL_EXPIRED" ? (
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {(firm?.name || "W").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {firm?.name && (
                      <p className="text-sm text-gray-500 mb-1">{firm.name}</p>
                    )}
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-lg font-bold ${
                        subscription.status === "TRIAL_EXPIRED"
                          ? "text-red-900"
                          : subscription.status === "TRIAL_ACTIVE"
                          ? "text-blue-900"
                          : "text-green-900"
                      }`}>
                        {subscription.status === "TRIAL_ACTIVE" && t.pricing.freeTrial}
                        {subscription.status === "TRIAL_EXPIRED" && t.pricing.freeTrial}
                        {subscription.status === "BASIC" && t.pricing.basicPlan}
                        {subscription.status === "PRO" && t.pricing.proPlan}
                        {subscription.status === "MAX" && t.pricing.maxPlan}
                      </h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        subscription.status === "TRIAL_EXPIRED"
                          ? "bg-red-200 text-red-700"
                          : "bg-green-200 text-green-700"
                      }`}>
                        {subscription.status === "TRIAL_EXPIRED" ? t.pricing.expired : t.pricing.active}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      subscription.status === "TRIAL_EXPIRED"
                        ? "text-red-700"
                        : subscription.status === "TRIAL_ACTIVE"
                        ? "text-blue-700"
                        : "text-green-700"
                    }`}>
                      {subscription.status === "TRIAL_ACTIVE" && `${t.pricing.trialMessage} ${subscription.daysRemaining} ${t.pricing.daysRemaining}.`}
                      {subscription.status === "TRIAL_EXPIRED" && t.pricing.trialExpired}
                      {["BASIC", "PRO", "MAX"].includes(subscription.status) && t.pricing.fullAccess}
                    </p>
                  </div>
                </div>

                {/* Days countdown */}
                {subscription.status === "TRIAL_ACTIVE" && subscription.daysRemaining !== null && (
                  <div className="text-center bg-white rounded-xl px-8 py-4 shadow-sm">
                    <div className="text-4xl font-bold text-blue-600">{subscription.daysRemaining}</div>
                    <div className="text-sm text-gray-500 font-medium">{t.pricing.daysRemaining}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plans grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => {
              const isCurrentPlan = subscription?.status === plan.id;

              return (
                <div
                  key={plan.name}
                  className={`bg-white rounded-2xl border-2 ${
                    isCurrentPlan
                      ? "border-green-400 ring-4 ring-green-100"
                      : plan.popular
                      ? "border-purple-400 ring-4 ring-purple-100"
                      : "border-gray-200"
                  } p-8 relative flex flex-col`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-green-600 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        {t.pricing.yourPlan}
                      </span>
                    </div>
                  )}
                  {!isCurrentPlan && plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-purple-600 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-lg">
                        {t.pricing.mostPopular}
                      </span>
                    </div>
                  )}

                  <div className={`w-14 h-14 ${plan.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <plan.icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <span className="text-3xl font-bold text-gray-400">{plan.price}</span>
                  </div>

                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full bg-green-100 text-green-700 py-4 rounded-xl font-semibold cursor-default mb-8 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {t.pricing.currentPlan}
                    </button>
                  ) : (
                    <button
                      disabled
                      className={`w-full ${plan.bgColor} text-gray-400 py-4 rounded-xl font-semibold cursor-not-allowed mb-8`}
                    >
                      {t.pricing.comingSoon}
                    </button>
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-4">{t.pricing.whatsIncluded}</p>
                    <ul className="space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className={`w-6 h-6 ${isCurrentPlan ? "bg-green-100" : plan.bgColor} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Check className={`w-4 h-4 ${isCurrentPlan ? "text-green-600" : plan.color.replace('bg-', 'text-')}`} />
                          </div>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ / Info section */}
          <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t.pricing.faq}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t.pricing.faqWhenPaid}</h3>
                <p className="text-gray-600">
                  {t.pricing.faqWhenPaidAnswer}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t.pricing.faqTrialExpire}</h3>
                <p className="text-gray-600">
                  {t.pricing.faqTrialExpireAnswer}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t.pricing.faqChangePlans}</h3>
                <p className="text-gray-600">
                  {t.pricing.faqChangePlansAnswer}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t.pricing.faqEnterprise}</h3>
                <p className="text-gray-600">
                  {t.pricing.faqEnterpriseAnswer}{" "}
                  <a href="mailto:sales@watergo.uz" className="text-blue-600 hover:underline">
                    sales@watergo.uz
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Contact section */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-2">
              {t.pricing.haveQuestions}
            </p>
            <a
              href="mailto:support@watergo.uz"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t.pricing.contactSupport}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
