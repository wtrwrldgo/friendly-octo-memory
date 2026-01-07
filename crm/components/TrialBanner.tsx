// file: components/TrialBanner.tsx

"use client";

import { useSubscription } from "@/contexts/SubscriptionContext";
import { Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function TrialBanner() {
  const { subscription, loading } = useSubscription();

  // Don't show banner if loading or no subscription info
  if (loading || !subscription) return null;

  // Don't show for paid plans
  if (["BASIC", "PRO", "MAX"].includes(subscription.status)) return null;

  // Trial expired - show urgent banner
  if (subscription.isTrialExpired || subscription.status === "TRIAL_EXPIRED") {
    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">
              <span className="font-semibold">Trial expired.</span>{" "}
              Your access has been limited. Upgrade to continue using WaterGo CRM.
            </p>
          </div>
          <Link
            href="/pricing"
            className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  // Trial active - show days remaining
  if (subscription.status === "TRIAL_ACTIVE" && subscription.daysRemaining !== null) {
    const isUrgent = subscription.daysRemaining <= 5;

    return (
      <div className={`${isUrgent ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"} border-b px-4 py-3`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Clock className={`h-5 w-5 ${isUrgent ? "text-amber-600" : "text-blue-600"}`} />
            <p className={`text-sm ${isUrgent ? "text-amber-800" : "text-blue-800"}`}>
              <span className="font-semibold">Free trial:</span>{" "}
              {subscription.daysRemaining} {subscription.daysRemaining === 1 ? "day" : "days"} remaining.
              {isUrgent && " Upgrade now to avoid interruption."}
            </p>
          </div>
          <Link
            href="/pricing"
            className={`${isUrgent ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors`}
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
