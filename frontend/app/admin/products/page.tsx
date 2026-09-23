import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Archive, CheckCircle2, AlertTriangle } from "lucide-react";
import { toggleArchiveProduct } from "@/actions/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage SKU listings, stock quantities, and product catalog visibility.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Stock Quantity</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {products.map((p) => {
                const isLowStock = p.stockQuantity <= 5 && p.stockQuantity > 0;
                const isOutOfStock = p.stockQuantity <= 0;

                return (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={
                              p.images[0] ||
                              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
                            }
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{p.title}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            ID: {p.id.slice(0, 10)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {p.category.name}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold">
                      {formatCurrency(Number(p.price))}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className={`font-bold ${
                            isOutOfStock
                              ? "text-destructive"
                              : isLowStock
                              ? "text-amber-500"
                              : "text-foreground"
                          }`}
                        >
                          {p.stockQuantity} units
                        </span>
                        {isLowStock && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {p.isArchived ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                          Archived
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await toggleArchiveProduct(p.id, !p.isArchived);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          type="submit"
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Archive className="w-3.5 h-3.5 mr-1" />
                          <span>{p.isArchived ? "Unarchive" : "Archive"}</span>
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
