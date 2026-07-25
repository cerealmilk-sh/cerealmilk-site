"use client";

// The shared sign-in modal: a centered Clerk auth surface (Google · Microsoft ·
// Apple, plus email one-time code). "Get 80x" opens it to create an account and
// continue to the full-screen checkout (/get); the nav "Log in" opens the same
// modal but lands returning customers on their account page (open({ redirectTo:
// "/account", … })). One email field covers both sign-up and sign-in, so the
// same modal serves new and returning users.
//
// ROLLOUT-SAFE: when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set, the provider
// buttons run real Clerk OAuth (redirect → /sso-callback → /get). With no key
// configured they simply advance to /get, so the site is fully usable while the
// Clerk app is being set up. To go live:
//   1. Create a Clerk application; add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY +
//      CLERK_SECRET_KEY to .env.local and to Vercel (Production env).
//   2. Enable Google, Microsoft and Apple in the Clerk dashboard
//      (Production instances need your own OAuth credentials per provider).

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { X } from "lucide-react";
import { cx, MarkTile } from "@/components/ui";

type Strategy = "oauth_google" | "oauth_microsoft" | "oauth_apple";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Where the modal lands after auth, plus the heading copy for the surface that
// opened it. "Get 80x" leaves these at their checkout defaults; the nav "Log in"
// passes redirectTo: "/account" so returning customers land on their account.
type OpenOpts = { redirectTo?: string; title?: string; subtitle?: string };

const DEFAULT_REDIRECT = "/get";
const DEFAULT_TITLE = "Get 80x";
const DEFAULT_SUBTITLE = "Create your account to continue to checkout.";

const GetStartedCtx = createContext<{ open: (opts?: OpenOpts) => void }>({ open: () => {} });

export function useGetStarted() {
  return useContext(GetStartedCtx);
}

export function GetStartedProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<OpenOpts | null>(null);
  const value = { open: useCallback((o?: OpenOpts) => setOpts(o ?? {}), []) };
  return (
    <GetStartedCtx.Provider value={value}>
      {children}
      <SignInModal opts={opts} onClose={() => setOpts(null)} />
    </GetStartedCtx.Provider>
  );
}

function SignInModal({ opts, onClose }: { opts: OpenOpts | null; onClose: () => void }) {
  const open = opts !== null;

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!opts) return null;

  const redirectTo = opts.redirectTo ?? DEFAULT_REDIRECT;
  const title = opts.title ?? DEFAULT_TITLE;
  const subtitle = opts.subtitle ?? DEFAULT_SUBTITLE;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-[400px] rounded-2xl border border-edge bg-panel p-7 shadow-pop">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-2 hover:text-ink"
        >
          <X size={16} strokeWidth={2.25} />
        </button>

        <div className="flex flex-col items-center text-center">
          <MarkTile size={40} />
          <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.015em] text-ink">{title}</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">{subtitle}</p>
        </div>

        {HAS_CLERK ? <ClerkProviders redirectTo={redirectTo} /> : <FallbackProviders redirectTo={redirectTo} />}

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-ink-faint">
          By continuing you agree to the{" "}
          <a href="/terms" className="underline decoration-edge-2 underline-offset-2 transition-colors hover:text-ink">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline decoration-edge-2 underline-offset-2 transition-colors hover:text-ink">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

/* Real OAuth via Clerk (v7 signals API). Only mounted when a publishable key is
   configured, so useSignIn always runs inside <ClerkProvider>. The provider
   redirects to /sso-callback to finish the handshake, then on to /get. */
function ClerkProviders({ redirectTo }: { redirectTo: string }) {
  const { signIn, fetchStatus } = useSignIn();
  const [busy, setBusy] = useState<Strategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = async (strategy: Strategy) => {
    setBusy(strategy);
    setError(null);
    try {
      // On success this navigates away to the OAuth provider and never resolves;
      // a resolved `error` means Clerk rejected the request before redirecting
      // (e.g. provider not enabled, or the instance doesn't allow this origin).
      // `redirectTo` rides through /sso-callback as `?after=` so OAuth lands on
      // the same destination as the email flow (checkout, or the account page).
      const { error: ssoError } = await signIn.sso({
        strategy,
        redirectUrl: redirectTo,
        redirectCallbackUrl: `/sso-callback?after=${encodeURIComponent(redirectTo)}`,
      });
      if (ssoError) {
        console.error("Clerk SSO failed to start:", ssoError);
        setBusy(null);
        setError(ssoError.longMessage ?? ssoError.message ?? "Couldn't start sign-in. Please try again.");
      }
    } catch (err) {
      console.error("Clerk SSO threw:", err);
      setBusy(null);
      const message = err instanceof Error ? err.message : null;
      setError(message ?? "Couldn't start sign-in. Please try again.");
    }
  };

  return (
    <>
      <ProviderButtons go={go} busy={busy} disabled={fetchStatus === "fetching"} error={error} />
      <OrDivider />
      <EmailCodeForm redirectTo={redirectTo} />
    </>
  );
}

/* Email one-time-code sign-in/sign-up. Works without any OAuth provider being
   configured, only "Email address" needs to be enabled in the Clerk dashboard
   (it is by default). One email field covers both new and returning users: we
   try to create an account, and if the email already exists we fall back to a
   sign-in code. Either path verifies a 6-digit code, then lands on /get. */
function EmailCodeForm({ redirectTo }: { redirectTo: string }) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    // Try sign-up first; if the email already has an account, switch to sign-in.
    const created = await signUp.create({ emailAddress: email });
    if (created.error?.code === "form_identifier_exists") {
      const sent = await signIn.emailCode.sendCode({ emailAddress: email });
      if (sent.error) return fail(sent.error);
      setMode("signin");
    } else if (created.error) {
      return fail(created.error);
    } else {
      const sent = await signUp.verifications.sendEmailCode();
      if (sent.error) return fail(sent.error);
      setMode("signup");
    }
    setBusy(false);
    setStep("code");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const verified =
      mode === "signup"
        ? await signUp.verifications.verifyEmailCode({ code })
        : await signIn.emailCode.verifyCode({ code });
    if (verified.error) return fail(verified.error);
    const finalized = mode === "signup" ? await signUp.finalize() : await signIn.finalize();
    if (finalized.error) return fail(finalized.error);
    router.push(redirectTo);
  };

  function fail(err: { longMessage?: string; message: string }) {
    setBusy(false);
    setError(err.longMessage ?? err.message ?? "Something went wrong. Please try again.");
  }

  if (step === "code") {
    return (
      <form onSubmit={verify} className="mt-4 space-y-2.5">
        <p className="text-center text-[12.5px] leading-relaxed text-ink-dim">
          We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>.
        </p>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          placeholder="Enter code"
          className="h-11 w-full rounded-xl border border-edge-2 bg-bg px-3.5 text-center text-[15px] tracking-[0.3em] text-ink outline-none placeholder:tracking-normal placeholder:text-ink-faint focus:border-accent"
        />
        <PrimaryButton busy={busy}>Verify &amp; continue</PrimaryButton>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
          }}
          className="w-full text-center text-[12px] text-ink-faint transition-colors hover:text-ink"
        >
          Use a different email
        </button>
        {error && <p className="text-center text-[12px] text-danger">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="mt-4 space-y-2.5">
      <input
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value.trim())}
        placeholder="you@company.com"
        className="h-11 w-full rounded-xl border border-edge-2 bg-bg px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-accent"
      />
      <PrimaryButton busy={busy}>Continue with email</PrimaryButton>
      {error && <p className="text-center text-[12px] text-danger">{error}</p>}
    </form>
  );
}

function OrDivider() {
  return (
    <div className="mt-5 flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-edge" />
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint">or</span>
      <span className="h-px flex-1 bg-edge" />
    </div>
  );
}

function PrimaryButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={cx(
        "flex h-11 w-full items-center justify-center rounded-xl bg-accent text-[14px] font-semibold text-white transition-colors",
        busy ? "opacity-70" : "hover:bg-accent-dim"
      )}
    >
      {children}
    </button>
  );
}

/* No Clerk configured yet → advance straight to checkout (keeps the flow usable
   while auth is being wired up). */
function FallbackProviders({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Strategy | null>(null);
  const go = (strategy: Strategy) => {
    setBusy(strategy);
    router.push(redirectTo);
  };
  return <ProviderButtons go={go} busy={busy} />;
}

function ProviderButtons({
  go,
  busy,
  disabled = false,
  error = null,
}: {
  go: (s: Strategy) => void;
  busy: Strategy | null;
  disabled?: boolean;
  error?: string | null;
}) {
  return (
    <>
      <div className="mt-6 space-y-2.5">
        <ProviderButton label="Continue with Google" busy={busy === "oauth_google"} disabled={disabled} onClick={() => go("oauth_google")}>
          <GoogleGlyph />
        </ProviderButton>
        <ProviderButton label="Continue with Microsoft" busy={busy === "oauth_microsoft"} disabled={disabled} onClick={() => go("oauth_microsoft")}>
          <MicrosoftGlyph />
        </ProviderButton>
        <ProviderButton label="Continue with Apple" busy={busy === "oauth_apple"} disabled={disabled} onClick={() => go("oauth_apple")}>
          <AppleGlyph />
        </ProviderButton>
      </div>
      {error && <p className="mt-3 text-center text-[12px] text-danger">{error}</p>}
    </>
  );
}

function ProviderButton({
  label,
  children,
  onClick,
  busy,
  disabled = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  busy: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className={cx(
        "flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-edge-2 bg-bg text-[14px] font-semibold text-ink transition-colors",
        busy || disabled ? "opacity-70" : "hover:bg-panel-2"
      )}
    >
      <span className="flex h-[18px] w-[18px] items-center justify-center">{children}</span>
      {label}
    </button>
  );
}

/* --- Provider brand glyphs (lucide has no brand logos) --------------------- */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function MicrosoftGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0" y="0" width="7.4" height="7.4" fill="#F25022" />
      <rect x="8.6" y="0" width="7.4" height="7.4" fill="#7FBA00" />
      <rect x="0" y="8.6" width="7.4" height="7.4" fill="#00A4EF" />
      <rect x="8.6" y="8.6" width="7.4" height="7.4" fill="#FFB900" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true" className="text-ink" fill="currentColor">
      <path d="M13.05 9.5c-.02-2.06 1.68-3.05 1.76-3.1-0.96-1.4-2.45-1.6-2.98-1.62-1.27-.13-2.48.74-3.12.74-.64 0-1.64-.72-2.7-.7-1.39.02-2.67.8-3.38 2.04-1.44 2.5-.37 6.2 1.03 8.23.69.99 1.5 2.1 2.57 2.06 1.03-.04 1.42-.66 2.67-.66 1.24 0 1.6.66 2.69.64 1.11-.02 1.81-1 2.49-2 .78-1.15 1.1-2.26 1.12-2.32-.02-.01-2.15-.83-2.17-3.27zM11.02 3.4c.57-.69.95-1.65.85-2.6-.82.03-1.81.54-2.4 1.23-.52.6-.98 1.58-.86 2.5.91.07 1.84-.46 2.41-1.13z" />
    </svg>
  );
}
