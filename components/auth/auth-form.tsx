"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Github, LoaderCircle, Moon, ShieldCheck, Sun } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AuthFieldErrors, AuthMode } from "@/types/auth";
import { getPasswordStrength, validateEmail, validatePassword } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "./auth-card";
import { AuthDivider } from "./auth-divider";
import { EmailInput } from "./email-input";
import { PasswordInput } from "./password-input";
import { SocialLoginButton } from "./social-login-button";

function GoogleMark({ size = 16, className }: { size?: number; className?: string }) { return <span style={{fontSize:size}} className={className} aria-hidden="true">G</span>; }

const copy: Record<AuthMode, { title: string; subtitle: string; action: string }> = {
  login: { title: "Welcome back", subtitle: "Continue learning exactly where you left off.", action: "Sign in" },
  signup: { title: "Create your study space", subtitle: "Start turning lectures into better learning habits.", action: "Create account" },
  "forgot-password": { title: "Reset your password", subtitle: "Enter your email and we’ll send you a secure reset link.", action: "Send reset link" },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [rememberMe, setRememberMe] = useState(false); const [errors, setErrors] = useState<AuthFieldErrors>({}); const [submitted, setSubmitted] = useState(false); const [loading, setLoading] = useState(false); const [authError, setAuthError] = useState(""); const [dark, setDark] = useState(false);
  const strength = useMemo(() => getPasswordStrength(password), [password]); const isReset = mode === "forgot-password"; const isSignup = mode === "signup"; const text = copy[mode];

  useEffect(() => {
    const message = new URLSearchParams(window.location.search).get("error");
    if (message) setAuthError(message);
  }, []);

  function toggleTheme() { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: AuthFieldErrors = { email: validateEmail(email), ...(!isReset ? validatePassword(password, isSignup ? confirmPassword : undefined) : {}) };
    Object.keys(next).forEach(key => { if (!next[key as keyof AuthFieldErrors]) delete next[key as keyof AuthFieldErrors]; });
    setErrors(next); setAuthError("");
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    const supabase = createClient();
    try {
      if (isReset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/update-password` });
        if (error) throw error;
        setSubmitted(true);
      } else if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
        if (error) throw error;
        if (data.session) { router.replace("/dashboard"); router.refresh(); }
        else setSubmitted(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const requested = new URLSearchParams(window.location.search).get("next");
        const destination = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
        router.replace(destination); router.refresh();
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <AuthCard><div className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{submitted ? (isReset ? "Check your inbox" : "You’re all set") : text.title}</h1><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{submitted ? (isReset ? `We sent a reset link to ${email}.` : "Confirm your email address to finish creating your account.") : text.subtitle}</p></div><button onClick={toggleTheme} type="button" aria-label="Toggle color theme" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/5">{dark ? <Sun size={17}/> : <Moon size={17}/>}</button></div>
    {submitted ? <div className="mt-7"><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10"><CheckCircle2 className="mx-auto text-emerald-600" size={30}/><p className="mt-3 text-sm font-bold text-emerald-900 dark:text-emerald-200">{isReset ? "Reset link requested" : "Check your inbox"}</p><p className="mt-1 text-xs leading-5 text-emerald-700 dark:text-emerald-300">{isReset ? "If an account exists for this email, a secure reset link is on its way." : "Use the confirmation link we sent to activate your LectureMate account."}</p></div><Link href="/login" className="mt-5 flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700">Back to sign in</Link></div> : <form className="mt-7" noValidate onSubmit={submit}>{authError && <p role="alert" className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{authError}</p>}<EmailInput value={email} onChange={setEmail} error={errors.email}/>{!isReset && <><div className="mt-4"><div className="flex items-center justify-between"><label className="text-xs font-bold text-slate-700 dark:text-slate-200" htmlFor="password">Password</label>{mode === "login" && <Link href="/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot password?</Link>}</div><PasswordInput value={password} onChange={setPassword} error={errors.password} showStrength={isSignup} strength={strength} autoComplete={isSignup ? "new-password" : "current-password"}/></div>{isSignup && <div className="mt-4"><PasswordInput id="confirm-password" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword} autoComplete="new-password"/></div>}{mode === "login" && <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"><input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/>Remember me for 30 days</label>}</>}<button type="submit" disabled={loading} className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70">{loading && <LoaderCircle size={16} className="animate-spin"/>}{loading ? "Please wait..." : text.action}</button>{!isReset && <><AuthDivider/><div className="grid grid-cols-2 gap-3"><SocialLoginButton label="Google" icon={GoogleMark}/><SocialLoginButton label="GitHub" icon={Github}/></div></>}<p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">{mode === "login" ? <>New to LectureMate? <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">Create an account</Link></> : isSignup ? <>Already have an account? <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Sign in</Link></> : <>Remembered your password? <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Sign in</Link></>}</p>{isSignup && <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-400"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-indigo-500"/>By creating an account, you agree to our Terms and Privacy Policy.</p>}</form>}</AuthCard>;
}
