"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, Shield, User, ArrowRight, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Invalid credentials. Please verify your email and password.");
        return;
      }

      toast.success("Authentication successful! Welcome back.");
      
      const cartItemsCount = useCartStore.getState().items.length;
      let targetUrl = callbackUrl;
      
      if (!searchParams.get("callbackUrl") || callbackUrl === "/") {
        targetUrl = cartItemsCount > 0 ? "/checkout" : "/products";
      }

      router.push(targetUrl);
      router.refresh();
    } catch {
      toast.error("An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: "ADMIN" | "CUSTOMER") => {
    if (role === "ADMIN") {
      setEmail("admin@store.com");
      setPassword("AdminPass123!");
    } else {
      setEmail("customer@gmail.com");
      setPassword("CustomerPass123!");
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg">
            Æ
          </div>
          <span className="font-extrabold text-xl tracking-tight">AESTHETE</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight mt-2">Welcome Back</h2>
        <p className="text-xs text-muted-foreground">
          Sign in to access your dashboard, order history, and preferences.
        </p>
      </div>

      {/* Quick Demo Credentials Switcher */}
      <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Quick Login Switcher</span>
          <span className="text-emerald-500 font-bold">1-Click Fill</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("ADMIN")}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-background border border-border text-xs font-semibold text-foreground hover:border-primary/60 transition shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Admin Demo</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("CUSTOMER")}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-background border border-border text-xs font-semibold text-foreground hover:border-primary/60 transition shadow-2xs"
          >
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Customer Demo</span>
          </button>
        </div>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 text-sm font-semibold mt-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Suspense fallback={<div className="w-full max-w-md h-96 rounded-3xl border border-border bg-card p-8 animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
