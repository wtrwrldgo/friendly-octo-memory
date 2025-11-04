// file: contexts/AuthContext.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

interface UserProfile {
  id: string;
  firm_id: string;
  email: string;
  name: string;
  role: "OWNER" | "MANAGER" | "OPERATOR";
  phone: string;
  city: string;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isOwner: boolean;
  isManager: boolean;
  isOperator: boolean;
  logout: () => Promise<void>; // Alias for signOut (compatibility)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Store in localStorage for backward compatibility
      if (data) {
        localStorage.setItem("userType", data.role === "OWNER" ? "admin" : "firm");
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("firmId", data.firm_id);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        // Not authenticated, redirect to login unless already on login page
        if (pathname !== "/login" && pathname !== "/") {
          router.push("/login");
        }
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        localStorage.removeItem("userType");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("firmId");
        if (pathname !== "/login" && pathname !== "/") {
          router.push("/login");
        }
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem("userType");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("firmId");
    router.push("/login");
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    logout: signOut, // Alias for compatibility
    isOwner: profile?.role === "OWNER",
    isManager: profile?.role === "MANAGER",
    isOperator: profile?.role === "OPERATOR",
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
