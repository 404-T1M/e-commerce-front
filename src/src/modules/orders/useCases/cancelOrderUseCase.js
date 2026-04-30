const AppError = require("../../../core/errors/appError");
const OrderRepository = require("../repositories/orderRepository");
const ProductVariantRepository = require("../../products/repositories/productVariantRepository");
const ProductRepository = require("../../products/repositories/productRepository");
const RefundWalletUseCase = require("../../customerWallet/useCases/refundWalletUseCase");

const CANCELLABLE_STATUSES = ["pending", "confirmed"];

class CancelOrderUseCase {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.variantRepository = new ProductVariantRepository();
    this.productRepository = new ProductRepository();
    this.refundWalletUseCase = new RefundWalletUseCase();
  }

  async execute(loggedInUser, orderId) {
    const order = await this.orderRepository.findByIdAndUser(
      orderId,
      loggedInUser.id,
    );

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new AppError(
        `Order cannot be cancelled once it is ${order.status}`,
        400,
      );
    }

    order.status = "cancelled";

    const soldCountByProduct = new Map();
    for (const item of order.items) {
      const variantId = item.variant?._id ?? item.variant;
      await this.variantRepository.incrementStock(variantId, item.quantity);

      const productId = item.variant?.product?._id ?? item.variant?.product;
      if (productId) {
        const key = String(productId);
        soldCountByProduct.set(key, (soldCountByProduct.get(key) ?? 0) + item.quantity);
      }
    }

    for (const [productId, qty] of soldCountByProduct.entries()) {
      await this.productRepository.updateOne(
        { _id: productId },
        { $inc: { soldCount: -qty } },
      );
    }

    if (
      order.paymentMethod?.key === "wallet" &&
      order.paymentStatus === "paid"
    ) {
      await this.refundWalletUseCase.execute(
        String(order.user._id ?? order.user),
        {
          amount: order.pricing.total,
          referenceId: order.orderNumber,
          note: `Refund for cancelled order ${order.orderNumber}`,
          performedBy: loggedInUser.id,
        },
      );
      order.paymentStatus = "refunded";
    }

    return await this.orderRepository.save(order);
  }
}

module.exports = CancelOrderUseCase;
