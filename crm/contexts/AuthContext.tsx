// file: contexts/AuthContext.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Use relative URL for API calls (goes through Next.js API routes which proxy to backend)
const API_URL = "/api";

interface UserProfile {
  id: string;
  firmId: string | null;
  email: string;
  name: string;
  role: "OWNER" | "MANAGER" | "OPERATOR" | "WATERGO_ADMIN";
  branchId: string | null;
}

interface FirmData {
  id: string;
  name: string;
  logoUrl?: string | null;
  city?: string | null;
  status?: string;
  isVisibleInClientApp?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; user?: UserProfile }>;
  signOut: () => Promise<void>;
  isOwner: boolean;
  isManager: boolean;
  isOperator: boolean;
  isWatergoAdmin: boolean;
  canAccessAllBranches: boolean;
  logout: () => Promise<void>;
  firm: FirmData | null;
  updateFirm: (updates: Partial<FirmData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firm, setFirm] = useState<FirmData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from localStorage (only on mount)
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    const savedFirm = localStorage.getItem("auth_firm");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      if (savedFirm) {
        setFirm(JSON.parse(savedFirm));
      }
    }
    // Don't redirect here - let individual pages handle their own auth checks

    setLoading(false);
  }, []);

  // Sign in using Express.js backend
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with API_URL:", API_URL);
      const response = await fetch(`${API_URL}/auth/staff/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      // data.data contains { token, user, firm }
      const { token: authToken, user: authUser, firm: authFirm } = data.data;

      // Store in state
      setToken(authToken);
      setUser(authUser);
      setFirm(authFirm);

      // Store in localStorage
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("auth_user", JSON.stringify(authUser));
      if (authFirm) {
        localStorage.setItem("auth_firm", JSON.stringify(authFirm));
      }

      // Also set cookie for middleware authentication
      document.cookie = `auth-token=${authToken}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30 days

      // Backward compatibility
      localStorage.setItem("userType", authUser.role === "WATERGO_ADMIN" ? "admin" : "firm");
      localStorage.setItem("userEmail", authUser.email);
      if (authUser.firmId) {
        localStorage.setItem("firmId", authUser.firmId);
      }

      return { error: null, user: authUser };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    setUser(null);
    setFirm(null);
    setToken(null);

    // Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_firm");
    localStorage.removeItem("userType");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("firmId");

    // Clear cookie
    document.cookie = "auth-token=; path=/; max-age=0";

    router.push("/login");
  };

  // Update firm data (for settings page)
  const updateFirm = (updates: Partial<FirmData>) => {
    if (firm) {
      const updatedFirm = { ...firm, ...updates };
      setFirm(updatedFirm);
      localStorage.setItem("auth_firm", JSON.stringify(updatedFirm));
    }
  };

  const value = {
    user,
    profile: user, // Alias for compatibility
    token,
    loading,
    signIn,
    signOut,
    logout: signOut, // Alias for compatibility
    isOwner: user?.role === "OWNER",
    isManager: user?.role === "MANAGER",
    isOperator: user?.role === "OPERATOR",
    isWatergoAdmin: user?.role === "WATERGO_ADMIN",
    canAccessAllBranches: user?.role === "OWNER" || user?.role === "WATERGO_ADMIN",
    firm,
    updateFirm,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
