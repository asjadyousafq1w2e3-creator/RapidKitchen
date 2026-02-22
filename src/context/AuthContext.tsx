import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let initialLoadDone = false;

    const checkAdminRole = async (userId: string) => {
      if (isCheckingAdmin) return;
      setIsCheckingAdmin(true);
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        if (isMounted) setIsAdmin(!!data);
      } catch {
        // On error, keep existing isAdmin value
      } finally {
        if (isMounted) setIsCheckingAdmin(false);
      }
    };

    // Listener for ONGOING auth changes — does NOT control loading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[Auth] Event:', event);
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          console.log('[Auth] Cleaning up state after SIGNED_OUT');
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          return;
        }

        if (newSession?.user) {
          // Use functional updates to avoid unnecessary state triggers if session hasn't changed
          setSession(prev => prev?.access_token === newSession.access_token ? prev : newSession);
          setUser(prev => prev?.id === newSession.user.id ? prev : newSession.user);

          // Only check admin role on key events to avoid loops
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
            checkAdminRole(newSession.user.id);
          }
        }
      }
    );

    // INITIAL load — controls loading state
    const initializeAuth = async () => {
      // CRITICAL: If the URL hash is stale (e.g. from an old tab), it can break the session.
      // If we see a hash that isn't specifically for the AuthCallback page, we clear it.
      if (window.location.hash && !window.location.pathname.includes('/auth/callback')) {
        console.log('[Auth] Clearing potentially stale URL hash');
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }

      const safetyTimeout = setTimeout(() => {
        if (isMounted && !initialLoadDone) {
          initialLoadDone = true;
          setLoading(false);
        }
      }, 5000);

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await checkAdminRole(initialSession.user.id);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        clearTimeout(safetyTimeout);
        if (isMounted) {
          initialLoadDone = true;
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
