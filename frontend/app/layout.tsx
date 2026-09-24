import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/storefront/cart-drawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E Com Web | Next-Gen E-Commerce Platform",
  description:
    "Production-ready, full-stack E-Commerce platform with Next.js App Router, Stripe Elements, NextAuth RBAC, and Prisma ORM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col`}>
        {children}
        <CartDrawer />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
