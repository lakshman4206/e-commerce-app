"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/products";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create account via registration API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account created successfully! Signing you in...");

      // 2. Automatically log the customer in
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        toast.info("Account created. Please log in with your credentials.");
        router.push("/login");
        return;
      }

      // 3. Redirect to destination (products catalog or checkout)
      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration error";
      toast.error(msg);
    } finally {
      setLoading(false);
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
        <h2 className="text-2xl font-bold tracking-tight mt-2">Create Customer Account</h2>
        <p className="text-xs text-muted-foreground">
          Join thousands of shoppers. Unlock fast checkout, order tracking, and exclusive releases.
        </p>
      </div>

      {/* Perks Badge */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-muted/40 border border-border/80 text-[11px] text-muted-foreground text-center">
        <div className="flex flex-col items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Fast Checkout</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Secure Data</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Order Tracking</span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <User className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          </div>
        </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
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
              <span>Creating your account...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span>Create Account &amp; Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Suspense fallback={<div className="w-full max-w-md h-96 rounded-3xl border border-border bg-card p-8 animate-pulse" />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
