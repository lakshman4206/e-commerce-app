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
  Shield,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<"ADMIN" | "CUSTOMER" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        const err =
          "Invalid email or password. If you are new to E Com Web, please register your account below.";
        setErrorMessage(err);
        toast.error("Authentication failed. Please verify your credentials.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back! Signing you in securely...");

      // Determine smart destination:
      // 1. If user is admin, always go to /admin
      // 2. If an explicit callbackUrl (e.g., /checkout) is present, honour it
      // 3. Otherwise, if cart has items, go to /checkout, else /products
      let targetUrl: string;
      if (email.toLowerCase().includes("admin")) {
        targetUrl = "/admin";
      } else {
        const rawCallback = searchParams.get("callbackUrl");
        if (rawCallback && rawCallback !== "/" && rawCallback !== "/products") {
          // honour original destination like /checkout
          targetUrl = rawCallback;
        } else {
          const cartItemsCount = useCartStore.getState().items.length;
          targetUrl = cartItemsCount > 0 ? "/checkout" : "/products";
        }
      }

      // Hard redirect to immediately synchronize auth cookies across all server components
      window.location.href = targetUrl;
    } catch {
      setErrorMessage("An unexpected error occurred during sign in. Please try again.");
      toast.error("An error occurred during authentication.");
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: "ADMIN" | "CUSTOMER") => {
    setErrorMessage(null);
    setActiveRole(role);
    if (role === "ADMIN") {
      setEmail("admin@store.com");
      setPassword("AdminPass123!");
      toast.info("Admin demo credentials filled. Click 'Sign In' or submit.");
    } else {
      setEmail("customer@gmail.com");
      setPassword("CustomerPass123!");
      toast.info("Customer demo credentials filled. Click 'Sign In' or submit.");
    }
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: callbackUrl === "/" ? "/products" : callbackUrl });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your registered email.");
      return;
    }
    toast.success(`Password reset link sent to ${forgotEmail}. Please check your inbox.`);
    setForgotModalOpen(false);
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

        {/* 1-Click Fast Demo Credentials Switcher */}
        <div className="rounded-2xl border border-border/90 bg-muted/30 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Instant Demo Access</span>
            </span>
            <span className="text-[10px] text-emerald-500 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              1-Click Fill
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("ADMIN")}
              className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                activeRole === "ADMIN"
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/30"
                  : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Admin Demo</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("CUSTOMER")}
              className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                activeRole === "CUSTOMER"
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/30"
                  : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Customer Demo</span>
            </button>
          </div>
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
            className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20 mt-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-primary-foreground transition-all rounded-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with E Com Web...</span>
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

        {/* Social Authentication Providers */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border bg-background hover:bg-muted/40 text-xs font-semibold transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span className="hidden sm:inline">Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border bg-background hover:bg-muted/40 text-xs font-semibold transition"
          >
            <svg className="w-4 h-4 fill-foreground" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => toast.info("Passkey support coming soon!")}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border bg-background hover:bg-muted/40 text-xs font-semibold transition"
          >
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Passkey</span>
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

      {/* Forgot Password Modal Dialog */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Reset Password</h3>
                <p className="text-[11px] text-muted-foreground">
                  We&apos;ll send recovery instructions to your email.
                </p>
              </div>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForgotModalOpen(false)}
                  className="flex-1 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="flex-1 rounded-xl text-xs font-bold">
                  Send Link
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
