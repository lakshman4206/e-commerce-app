"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      title="Sign Out"
    >
      <LogOut className="w-3.5 h-3.5" />
    </Button>
  );
}
