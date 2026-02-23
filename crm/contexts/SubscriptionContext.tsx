// file: contexts/SubscriptionContext.tsx

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

export type SubscriptionStatus = "TRIAL_ACTIVE" | "TRIAL_EXPIRED" | "BASIC" | "PRO" | "MAX";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  trialStartAt: string | null;
  trialEndAt: string | null;
  daysRemaining: number | null;
  isTrialExpired: boolean;
  hasAccess: boolean;
}

interface SubscriptionContextType {
  subscription: SubscriptionInfo | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const TRIAL_DAYS = 30;

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { profile, firm, loading: authLoading, isWatergoAdmin } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateSubscription = useCallback(async () => {
    // Don't calculate if no profile
    if (!profile?.firmId) {
      setLoading(false);
      return;
    }

    // WaterGo admin has unlimited access
    if (isWatergoAdmin || profile.role === "WATERGO_ADMIN") {
      setSubscription({
        status: "MAX",
        trialStartAt: null,
        trialEndAt: null,
        daysRemaining: null,
        isTrialExpired: false,
        hasAccess: true,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch firm details (use CRM API route as proxy)
      const response = await fetch(`/api/firms/${profile.firmId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch firm details");
      }

      const result = await response.json();
      const firmData = result.success ? result.data : result;

      const now = new Date();
      const statusFromApi = (firmData?.subscriptionStatus || "TRIAL_ACTIVE") as SubscriptionStatus;
      const trialStartAtStr = firmData?.trialStartAt || firmData?.createdAt || null;
      const trialEndAtStr = firmData?.trialEndAt || null;
      const trialEndDate = trialEndAtStr ? new Date(trialEndAtStr) : null;
      const hasValidTrialEnd = !!trialEndDate && !Number.isNaN(trialEndDate.getTime());

      let daysRemaining: number | null = null;
      let isTrialExpired = false;

      if (hasValidTrialEnd && trialEndDate) {
        daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        isTrialExpired = daysRemaining <= 0;
      } else if (statusFromApi === "TRIAL_EXPIRED") {
        daysRemaining = 0;
        isTrialExpired = true;
      }

      // Keep paid plan access regardless of trial dates
      const effectiveStatus: SubscriptionStatus =
        statusFromApi === "TRIAL_ACTIVE" && isTrialExpired ? "TRIAL_EXPIRED" : statusFromApi;
      const hasAccess = ["BASIC", "PRO", "MAX"].includes(effectiveStatus) || !isTrialExpired;

      setSubscription({
        status: effectiveStatus,
        trialStartAt: trialStartAtStr,
        trialEndAt: trialEndAtStr,
        daysRemaining: daysRemaining !== null ? Math.max(0, daysRemaining) : null,
        isTrialExpired,
        hasAccess,
      });
    } catch (err: any) {
      console.error("Error calculating subscription:", err);
      setError(err.message);
      // Default to trial active if we can't fetch (graceful degradation)
      setSubscription({
        status: "TRIAL_ACTIVE",
        trialStartAt: null,
        trialEndAt: null,
        daysRemaining: TRIAL_DAYS,
        isTrialExpired: false,
        hasAccess: true,
      });
    } finally {
      setLoading(false);
    }
  }, [profile, isWatergoAdmin]);

  // Calculate subscription when profile changes
  useEffect(() => {
    if (!authLoading && profile) {
      calculateSubscription();
    } else if (!authLoading && !profile) {
      setLoading(false);
    }
  }, [authLoading, profile, calculateSubscription]);

  const refreshSubscription = useCallback(async () => {
    await calculateSubscription();
  }, [calculateSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
