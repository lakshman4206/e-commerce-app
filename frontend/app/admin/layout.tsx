import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Store,
  LogOut,
  Shield,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Enforce ADMIN role at server component level
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block">
                ADMIN CONSOLE
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                E Com Web OS v1.0
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-foreground bg-muted/60 hover:bg-muted transition"
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span>Overview</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
            >
              <Package className="w-4 h-4" />
              <span>Products &amp; Stock</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Orders &amp; Fulfill</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer User profile */}
        <div className="p-4 border-t border-border space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-muted transition"
          >
            <Store className="w-4 h-4" />
            <span>Switch to Storefront</span>
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/50">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-semibold truncate">{session.user.name || "Admin"}</div>
              <div className="text-[10px] text-muted-foreground truncate">{session.user.email}</div>
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>Admin</span>
            <span>/</span>
            <span className="text-foreground">Control Center</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stripe Sandbox Ready
            </span>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
