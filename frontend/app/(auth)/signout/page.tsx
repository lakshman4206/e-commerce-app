"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
      <div className="flex items-center gap-3 text-muted-foreground text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Signing you out securely...</span>
      </div>
    </div>
  );
}
