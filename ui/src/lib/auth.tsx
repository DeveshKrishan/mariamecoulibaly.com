import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { ApiError, getAdminMe, type AdminMe } from './api';
import { isSupabaseConfigured, supabase } from './supabase';

type AuthContextValue = {
  session: Session | null;
  accessToken: string | null;
  loading: boolean;
  configured: boolean;
  isAdmin: boolean;
  admin: AdminMe | null;
  adminLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) {
      setAdmin(null);
      setAdminLoading(false);
      return;
    }

    let cancelled = false;
    setAdminLoading(true);
    getAdminMe(token)
      .then((me) => {
        if (!cancelled) setAdmin(me);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setAdmin(null);
          if (!(err instanceof ApiError && (err.status === 401 || err.status === 403))) {
            console.error(err);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setAdminLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    const redirectTo = `${window.location.origin}/admin/login`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setAdmin(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      accessToken: session?.access_token ?? null,
      loading,
      configured: isSupabaseConfigured,
      isAdmin: Boolean(admin),
      admin,
      adminLoading,
      signInWithGoogle,
      signOut,
    }),
    [session, loading, admin, adminLoading, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
