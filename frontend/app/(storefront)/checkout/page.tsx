import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/products"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Catalog</span>
        </Link>
        <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span>PCI-DSS Level 1 Compliant</span>
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Express Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Confirm your destination and finalize payment through our verified Razorpay payment gateway.
        </p>
      </div>

      <CheckoutForm />
    </div>
  );
}
