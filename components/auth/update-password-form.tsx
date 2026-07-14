"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import type { AuthFieldErrors } from "@/types/auth";
import { getPasswordStrength, validatePassword } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "./auth-card";
import { PasswordInput } from "./password-input";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [errors, setErrors] = useState<AuthFieldErrors>({}); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false); const [complete, setComplete] = useState(false);
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const next = validatePassword(password, confirmPassword); setErrors(next); setMessage(""); if (Object.keys(next).length) return; setLoading(true); const { error } = await createClient().auth.updateUser({ password }); setLoading(false); if (error) setMessage(error.message); else setComplete(true); }
  return <AuthCard><h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Choose a new password</h1><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Use a strong password you have not used before.</p>{complete ? <div className="mt-7"><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10"><CheckCircle2 className="mx-auto text-emerald-600" size={30}/><p className="mt-3 text-sm font-bold text-emerald-900 dark:text-emerald-200">Password updated</p></div><Link href="/dashboard" className="mt-5 flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white">Continue to dashboard</Link></div> : <form className="mt-7" noValidate onSubmit={submit}>{message && <p role="alert" className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{message}</p>}<PasswordInput value={password} onChange={setPassword} error={errors.password} showStrength strength={strength} autoComplete="new-password"/><div className="mt-4"><PasswordInput id="confirm-password" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword} autoComplete="new-password"/></div><button type="submit" disabled={loading} className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-70">{loading && <LoaderCircle size={16} className="animate-spin"/>}{loading ? "Updating..." : "Update password"}</button></form>}</AuthCard>;
}
