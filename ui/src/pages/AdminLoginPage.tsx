import { useEffect, useState } from 'react';
import { Seo } from '../components/seo/Seo';
import { ApiError, getAdminMe, type AdminMe } from '../lib/api';
import { useAuth } from '../lib/auth';

export function AdminLoginPage() {
  const { accessToken, loading, configured, signInWithGoogle, signOut, session } =
    useAuth();
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setAdmin(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setChecking(true);
    getAdminMe(accessToken)
      .then((me) => {
        if (!cancelled) {
          setAdmin(me);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setAdmin(null);
          const status = err instanceof ApiError ? err.status : 0;
          if (status === 403) {
            setError(
              'Signed in with Google, but this email is not on the admin allowlist.',
            );
          } else if (status === 401) {
            setError('Session was rejected by the API. Try signing in again.');
          } else {
            setError('Could not verify admin access with the API.');
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function onSignIn() {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError('Google sign-in failed. Check Supabase Auth Google settings.');
      setSigningIn(false);
    }
  }

  async function onSignOut() {
    setError(null);
    await signOut();
    setAdmin(null);
  }

  return (
    <>
      <Seo
        title="Admin"
        description="Admin sign-in for portfolio content editing."
        url="/admin/login"
      />
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-heading text-3xl tracking-tight text-[var(--color-ink)]">
          Admin
        </h1>
        <p className="mt-3 text-black/60">
          Sign in with Google to manage portfolio content. Only allowlisted
          emails can use write APIs.
        </p>

        {!configured && (
          <p className="mt-8 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Set <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to enable Google sign-in.
          </p>
        )}

        {configured && loading && (
          <p className="mt-8 text-sm text-black/60">Loading session…</p>
        )}

        {configured && !loading && !session && (
          <button
            type="button"
            onClick={onSignIn}
            disabled={signingIn}
            className="mt-8 inline-flex items-center justify-center border border-[var(--color-ink)] bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {signingIn ? 'Redirecting…' : 'Sign in with Google'}
          </button>
        )}

        {configured && !loading && session && (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-black/60">
              Google account:{' '}
              <span className="text-[var(--color-ink)]">
                {session.user.email ?? 'unknown'}
              </span>
            </p>
            {checking && (
              <p className="text-sm text-black/60">Checking allowlist…</p>
            )}
            {admin && (
              <p className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Admin access confirmed for {admin.displayName} ({admin.email}).
                Edit mode UI comes next.
              </p>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center justify-center border border-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:bg-black/5"
            >
              Sign out
            </button>
          </div>
        )}

        {error && (
          <p className="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
