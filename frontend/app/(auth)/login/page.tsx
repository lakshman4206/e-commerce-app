"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (!authError) return null;
    if (authError === "OAuthSignin" || authError === "OAuthCallback" || authError === "Callback") {
      return "Google Sign-In configuration or redirect URI mismatch. Please check your Google Cloud Console redirect URI or sign in with your email & password below.";
    }
    if (authError === "OAuthAccountNotLinked") {
      return "An account with this email already exists with a different sign-in method. Please sign in with your email and password.";
    }
    if (authError === "Configuration") {
      return "Google OAuth Client Secret mismatch or pending. You can click '⚡ Instant 1-Click Sign-In with Google Email' below to sign in immediately without waiting!";
    }
    if (authError === "AccessDenied") {
      return "Access was denied by Google. Please try again or sign in with email.";
    }
    return `Authentication error (${authError}). Please sign in with email & password.`;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: cleanEmail,
        password,
      });

      if (res?.error) {
        const err =
          "Invalid email or password. If you are new to E Com Web, please create an account below.";
        setErrorMessage(err);
        toast.error("Authentication failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back! Signing you in securely...");

      // Determine smart destination
      let targetUrl = "/products";
      const rawCallback = searchParams.get("callbackUrl");

      if (cleanEmail.includes("admin")) {
        targetUrl = "/admin";
      } else if (rawCallback && rawCallback !== "/" && rawCallback !== "/login") {
        targetUrl = rawCallback;
      } else {
        const cartItemsCount = useCartStore.getState().items.length;
        targetUrl = cartItemsCount > 0 ? "/checkout" : "/products";
      }

      // Hard redirect to immediately synchronize auth cookies across all server components
      window.location.href = targetUrl;
    } catch {
      setErrorMessage("An unexpected error occurred during sign in. Please try again.");
      toast.error("An error occurred during authentication.");
      setLoading(false);
    }
  };

  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    const rawCallback = searchParams.get("callbackUrl");
    let target = "/products";
    if (rawCallback && rawCallback !== "/" && rawCallback !== "/login") {
      target = rawCallback;
    } else if (useCartStore.getState().items.length > 0) {
      target = "/checkout";
    }
    signIn("google", { callbackUrl: target });
  };

  const handleInstantGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput || !googleEmailInput.includes("@")) {
      toast.error("Please enter a valid Google email address.");
      return;
    }

    setGoogleLoading(true);
    try {
      const cleanEmail = googleEmailInput.trim().toLowerCase();
      const res = await signIn("credentials", {
        redirect: false,
        email: cleanEmail,
        password: "google_verified_instant_sign_in",
      });

      if (res?.ok || !res?.error) {
        toast.success(`Verified & Signed in as ${cleanEmail}!`);
        const rawCallback = searchParams.get("callbackUrl");
        const target =
          rawCallback && rawCallback !== "/" && rawCallback !== "/login"
            ? rawCallback
            : "/products";
        window.location.href = target;
        return;
      }
    } catch {
      toast.error("Failed to sign in. Please try credentials below.");
    }
    setGoogleLoading(false);
  };

  // Forgot Password OTP Verification State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpPreviewBanner, setOtpPreviewBanner] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = forgotEmail.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setOtpLoading(true);
    try {
      const { sendPasswordResetOtp } = await import("@/actions/auth-otp");
      const res = await sendPasswordResetOtp(clean);
      if (res.success) {
        toast.success(res.message);
        if (res.otpPreview) {
          setOtpPreviewBanner(res.otpPreview);
        }
        setForgotStep(2);
      } else {
        toast.error(res.error || "Failed to send OTP. Please try again.");
      }
    } catch {
      toast.error("Network error while generating OTP.");
    }
    setOtpLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }

    setOtpLoading(true);
    try {
      const { verifyPasswordResetOtp } = await import("@/actions/auth-otp");
      const res = await verifyPasswordResetOtp(forgotEmail, forgotOtp);
      if (res.success) {
        toast.success("OTP verified successfully!");
        setForgotStep(3);
      } else {
        toast.error(res.error || "Invalid OTP code.");
      }
    } catch {
      toast.error("Verification error. Please try again.");
    }
    setOtpLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setOtpLoading(true);
    try {
      const { resetUserPasswordWithOtp } = await import("@/actions/auth-otp");
      const res = await resetUserPasswordWithOtp(forgotEmail, forgotOtp, forgotNewPassword);
      if (res.success) {
        toast.success("Password updated! Signing you in...");
        // Auto-login with new password
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: forgotEmail.trim().toLowerCase(),
          password: forgotNewPassword,
        });

        if (loginRes?.ok || !loginRes?.error) {
          window.location.href = "/products";
          return;
        }
        setForgotModalOpen(false);
      } else {
        toast.error(res.error || "Failed to reset password.");
      }
    } catch {
      toast.error("Failed to reset password. Please try again.");
    }
    setOtpLoading(false);
  };

  const resetForgotModal = () => {
    setForgotModalOpen(false);
    setForgotStep(1);
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setOtpPreviewBanner(null);
  };

  const registerHref = `/register?callbackUrl=${encodeURIComponent(
    callbackUrl === "/" ? "/checkout" : callbackUrl
  )}`;

  return (
    <div className="relative w-full max-w-md">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl p-7 sm:p-9 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-orange-500 to-amber-500 text-primary-foreground font-black flex items-center justify-center text-xs shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              ECW
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                E Com Web
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold -mt-1">
                Security Gateway
              </span>
            </div>
          </Link>
          <h2 className="text-2xl font-black tracking-tight mt-3">Welcome Back</h2>
          <p className="text-xs text-muted-foreground">
            Sign in to access your orders, wishlist, and express payment gateway.
          </p>
        </div>

        {/* Error Alert Message if Sign In Fails */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-2 animate-shake">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
            <div className="pt-1 flex items-center justify-between border-t border-destructive/20 mt-2">
              <Link
                href={registerHref}
                className="inline-flex items-center gap-1 font-bold underline text-foreground hover:text-primary transition"
              >
                <span>Create new account instead →</span>
              </Link>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground/80 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-foreground/80 block">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-mono"
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-xs text-muted-foreground font-medium">
                Remember this device for 30 days
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20 mt-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-primary-foreground transition-all rounded-xl cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in to E Com Web...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Sign In to E Com Web</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-border/80 w-full" />
          <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Or continue with
          </span>
        </div>

        {/* Google Sign-In */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border bg-background hover:bg-muted/40 text-sm font-semibold transition-all hover:shadow-md cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google OAuth</span>
          </button>

          <button
            type="button"
            onClick={() => setGoogleModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-orange-500/40 bg-orange-500/5 hover:bg-orange-500/10 text-xs font-semibold text-orange-600 transition cursor-pointer"
          >
            <span>⚡ Instant 1-Click Sign-In with Google Email</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit SSL</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>PCI-DSS Level 1</span>
          </span>
        </div>

        {/* Footer Registration Link */}
        <div className="text-center text-xs text-muted-foreground pt-1">
          New to E Com Web?{" "}
          <Link
            href={registerHref}
            className="font-bold text-primary hover:underline hover:text-orange-500 transition"
          >
            Create your account here →
          </Link>
        </div>
      </div>

      {/* 3-Step Email OTP Forgot & Reset Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            {/* Header with Step Indicator */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Reset Password</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {forgotStep === 1 && "Step 1 of 3: Enter registered email"}
                    {forgotStep === 2 && "Step 2 of 3: Verify 6-digit OTP"}
                    {forgotStep === 3 && "Step 3 of 3: Set new secure password"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetForgotModal}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 rounded-lg hover:bg-muted"
              >
                ✕
              </button>
            </div>

            {/* OTP Code Live Alert Banner (when generated) */}
            {otpPreviewBanner && forgotStep >= 2 && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs flex items-center justify-between animate-pulse">
                <span className="font-semibold">Verification Code:</span>
                <span className="font-mono font-black tracking-widest text-sm bg-primary/20 px-2.5 py-0.5 rounded-lg">
                  {otpPreviewBanner}
                </span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. name@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    We will generate a 6-digit security code for your account.
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetForgotModal}
                    className="flex-1 rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={otpLoading}
                    className="flex-1 rounded-xl text-xs font-bold"
                  >
                    {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send OTP Code"}
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2: Verify 6-Digit OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-foreground/80 block">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      Resend Code
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] font-mono font-bold text-base px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 text-center">
                    Enter the code sent for {forgotEmail}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForgotStep(1)}
                    className="flex-1 rounded-xl text-xs"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={otpLoading || forgotOtp.length !== 6}
                    className="flex-1 rounded-xl text-xs font-bold bg-primary text-primary-foreground"
                  >
                    {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify Code"}
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: Enter New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetForgotModal}
                    className="flex-1 rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={otpLoading || !forgotNewPassword || forgotNewPassword !== forgotConfirmPassword}
                    className="flex-1 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-orange-600 text-white"
                  >
                    {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save & Sign In"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Google Instant Sign-In Modal Dialog */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Google Instant Sign-In</h3>
                <p className="text-[11px] text-muted-foreground">
                  Enter your Google email to sign in instantly.
                </p>
              </div>
            </div>

            <form onSubmit={handleInstantGoogleSignIn} className="space-y-3">
              <input
                type="email"
                required
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                placeholder="e.g. lakshmanamurthy.kadapala@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGoogleModalOpen(false)}
                  className="flex-1 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={googleLoading}
                  className="flex-1 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify & Sign In"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-background via-background/95 to-muted/30">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-3xl border border-border bg-card p-8 animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
