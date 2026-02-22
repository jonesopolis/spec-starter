import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type AuthSession = {
  email: string;
  patientUserId: string;
  internalPatientId: string;
  role: "PATIENT" | "ADMIN";
};

function toRole(email: string): "PATIENT" | "ADMIN" {
  const normalized = email.trim().toLowerCase();
  const adminList = (process.env.EXPO_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return adminList.includes(normalized) ? "ADMIN" : "PATIENT";
}

function mapSession(user: { id: string; email?: string | null }): AuthSession {
  const email = user.email || "";
  return {
    email,
    patientUserId: user.id,
    internalPatientId: user.id,
    role: toRole(email)
  };
}

export function useSupabaseAuth(): { session: AuthSession | null; isLoading: boolean } {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from SecureStore on mount
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSession(mapSession(data.session.user));
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      if (supabaseSession?.user) {
        setSession(mapSession(supabaseSession.user));
      } else {
        setSession(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, isLoading };
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  return { error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "journeyhealth://auth/reset-password"
  });
  return { error };
}
