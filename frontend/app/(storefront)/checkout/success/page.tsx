import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

interface SuccessPageProps {
  searchParams: {
    orderId?: string;
  };
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { orderId } = searchParams;

  let order = null;
  if (orderId) {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-20 max-w-xl text-center">
      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight">Order Confirmed!</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        Your payment was authorized and received. A tracking notification will be dispatched once fulfillment begins.
      </p>

      {order && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-border/60 pb-3">
            <div>
              <span className="text-xs text-muted-foreground block">Order Identifier</span>
              <span className="font-mono text-xs font-semibold">{order.id}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
              {order.status}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Purchased Artifacts
            </span>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs">
                <span>
                  {item.product.title} × {item.quantity}
                </span>
                <span className="font-mono">
                  {formatCurrency(Number(item.priceAtPurchase) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 pt-3 flex justify-between font-bold text-sm">
            <span>Total Paid</span>
            <span className="font-mono text-primary">
              {formatCurrency(Number(order.totalAmount))}
            </span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/products" className="flex items-center gap-2">
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg" className="w-full sm:w-auto">
          <Link href="/orders" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>View Order History</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
