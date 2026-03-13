import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { logger } from "../utils/logger.js";
import { ORDER_STATUS } from "../constants/order.js";

const PAYMENT_TIMEOUT_MINUTES = parseInt(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || "30", 10);

export async function cancelExpiredOrders(): Promise<void> {
  const cutoff = new Date(Date.now() - PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

  const expiredOrders = await Order.find({
    status: ORDER_STATUS.pendingPayment,
    createdAt: { $lt: cutoff },
  });

  for (const order of expiredOrders) {
    try {
      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty },
        });
      }

      order.status = ORDER_STATUS.cancelled;
      await order.save();

      logger.info(`Auto-cancelled expired order ${order._id} and restored stock`);
    } catch (err) {
      logger.error({ err }, `Failed to cancel expired order ${order._id}`);
    }
  }

  if (expiredOrders.length > 0) {
    logger.info(`Processed ${expiredOrders.length} expired orders`);
  }
}
