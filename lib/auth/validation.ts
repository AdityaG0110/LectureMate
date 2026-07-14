import type { AuthFieldErrors, PasswordStrength } from "@/types/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required.";
  if (!emailPattern.test(email)) return "Enter a valid email address.";
  return undefined;
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels: PasswordStrength["label"][] = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  return { score: score as PasswordStrength["score"], label: labels[score] };
}

export function validatePassword(password: string, confirmPassword?: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  if (!password) errors.password = "Password is required.";
  else if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (confirmPassword !== undefined && confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}
