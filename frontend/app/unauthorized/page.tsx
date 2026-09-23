import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-destructive">
            403 Forbidden Access
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Administrator Clearance Required
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your current account credentials hold customer-level authorization. Access to administrative control surfaces, analytics, and inventories is restricted to verified administrators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/" className="flex items-center justify-center gap-1.5">
              <Home className="w-4 h-4" />
              <span>Storefront</span>
            </Link>
          </Button>

          <Button asChild className="flex-1">
            <Link href="/login" className="flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Login</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
