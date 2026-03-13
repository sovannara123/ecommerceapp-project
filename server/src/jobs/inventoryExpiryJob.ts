import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { ORDER_STATUS } from "../constants/order.js";

// Configurable timeout — default 30 minutes
const RESERVATION_TIMEOUT_MS = parseInt(
  process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || "30",
  10
) * 60 * 1000;

/**
 * Finds orders stuck in "pending_payment" status beyond the timeout window,
 * restores reserved inventory, and marks orders as cancelled.
 */
export async function cancelExpiredReservations(): Promise<void> {
  const cutoff = new Date(Date.now() - RESERVATION_TIMEOUT_MS);

  const expiredOrders = await Order.find({
    status: ORDER_STATUS.pendingPayment,
    $or: [
      { reservationExpiresAt: { $lt: new Date() } },
      { reservationExpiresAt: { $exists: false }, createdAt: { $lt: cutoff } },
    ],
  });

  if (expiredOrders.length === 0) return;

  console.log(`[InventoryExpiry] Processing ${expiredOrders.length} expired order(s)...`);

  for (const order of expiredOrders) {
    try {
      // Restore stock for each item in the order
      const stockOps = order.items.map((item: any) =>
        Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.qty } },
          { new: true }
        )
      );
      await Promise.all(stockOps);

      // Mark order as cancelled
      order.status = ORDER_STATUS.cancelled;
      (order as any).cancelledAt = new Date();
      (order as any).cancelReason = "Payment timeout — inventory released automatically";
      await order.save();

      console.log(`[InventoryExpiry] Cancelled order ${order._id}, restored ${order.items.length} item(s)`);
    } catch (err) {
      console.error(`[InventoryExpiry] Failed to process order ${order._id}:`, err);
    }
  }

  console.log(`[InventoryExpiry] Done. ${expiredOrders.length} order(s) cancelled.`);
}
