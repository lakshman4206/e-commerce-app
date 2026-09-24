import { getCustomerOrders } from "@/actions/orders";
import { OrdersList } from "@/components/storefront/orders-list";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const initialOrders = await getCustomerOrders();

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Order History &amp; Tracking</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review all your placed orders, live courier dispatch, GST invoices, and 1-click Razorpay refund management.
        </p>
      </div>

      <OrdersList initialOrders={initialOrders} />
    </div>
  );
}
