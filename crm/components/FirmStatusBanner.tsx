// file: components/FirmStatusBanner.tsx

"use client";

import { AlertCircle, Clock, CheckCircle, XCircle, Info } from "lucide-react";
import { FirmStatus } from "@/types";

interface FirmStatusBannerProps {
  status: FirmStatus;
  isVisibleInClientApp: boolean;
  rejectionReason?: string | null;
  onSubmitForReview?: () => void;
  isSubmitting?: boolean;
}

export default function FirmStatusBanner({
  status,
  isVisibleInClientApp,
  rejectionReason,
  onSubmitForReview,
  isSubmitting = false,
}: FirmStatusBannerProps) {
  // If firm is visible in client app, show simple success message
  if (isVisibleInClientApp) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              Your firm is active and visible to clients
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Customers can now find and order from your firm in the WaterGo app.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Firm is NOT visible in client app - show appropriate onboarding/status UI

  if (status === "SUSPENDED") {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-200">
              Firm suspended
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              Your firm has been suspended. Please contact support for more information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "PENDING_REVIEW") {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              Awaiting WaterGo approval
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Your firm is under review. We&apos;ll notify you once it&apos;s approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // DRAFT or ACTIVE but not visible - show onboarding UI
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-orange-800 dark:text-orange-200">
            Complete your profile to go live
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
            Add your products, staff, and operating hours, then submit for review.
          </p>

          {/* Show rejection reason if previously rejected */}
          {rejectionReason && (
            <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-3 mb-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Previous submission was rejected:
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {onSubmitForReview && (
            <button
              onClick={onSubmitForReview}
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
