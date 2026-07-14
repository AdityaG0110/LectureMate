export type AuthMode = "login" | "signup" | "forgot-password";

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too weak" | "Weak" | "Fair" | "Strong" | "Excellent";
}

export type AuthFieldErrors = Partial<Record<"email" | "password" | "confirmPassword", string>>;
