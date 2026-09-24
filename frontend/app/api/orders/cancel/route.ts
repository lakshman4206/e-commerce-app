import { NextResponse } from "next/server";
import { cancelAndRefundOrder } from "@/actions/orders";

export async function POST(req: Request) {
  try {
    const { orderId, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const result = await cancelAndRefundOrder(orderId, reason || "Mistakenly placed by customer");
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to cancel and refund order" },
      { status: 500 }
    );
  }
}
