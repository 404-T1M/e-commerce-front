const AppError = require("../../../core/errors/appError");
const CartRepository = require("../../cart/repositories/cartRepository");
const OrderRepository = require("../repositories/orderRepository");
const CouponRepository = require("../../coupons/repositories/couponRepository");
const AddressRepository = require("../../customerAddresses/repositories/addressRepository");
const ShippingMethodRepository = require("../../shippingMethods/repositories/shippingMethodRepository");
const PaymentMethodRepository = require("../../paymentMethods/repositories/paymentMethodRepository");
const ProductVariantRepository = require("../../products/repositories/productVariantRepository");
const ProductRepository = require("../../products/repositories/productRepository");
const WalletRepository = require("../../customerWallet/repositories/walletRepository");
const CartPricingService = require("../../../shared/services/cartService");
const Coupon = require("../../coupons/models/couponModel");
const DebitWalletUseCase = require("../../customerWallet/useCases/debitWalletUseCase");

class PlaceOrderUseCase {
  constructor() {
    this.cartRepository = new CartRepository();
    this.orderRepository = new OrderRepository();
    this.couponRepository = new CouponRepository();
    this.addressRepository = new AddressRepository();
    this.shippingMethodRepository = new ShippingMethodRepository();
    this.paymentMethodRepository = new PaymentMethodRepository();
    this.productRepository = new ProductRepository();
    this.variantRepository = new ProductVariantRepository();
    this.walletRepository = new WalletRepository();
    this.debitWalletUseCase = new DebitWalletUseCase();
  }

  async execute(
    loggedInUser,
    { addressId, shippingMethodId, paymentMethodId },
  ) {
    const cart = await this.cartRepository.findByUser(loggedInUser.id);
    if (!cart || cart.items.length === 0) {
      throw new AppError("Your cart is empty", 400);
    }

    const couponCode = cart.coupon?.code ?? null;

    const pricesChanged = CartPricingService.refreshPrices(cart);
    if (pricesChanged) await this.cartRepository.save(cart);

    for (const item of cart.items) {
      const variant = item.variant;
      const product = variant.product;

      if (!product || product.isDeleted || !product.published) {
        throw new AppError(
          `Product "${product?.name?.en ?? "unknown"}" is no longer available`,
          400,
        );
      }

      if (variant.isDeleted || !variant.published) {
        throw new AppError(
          `A variant of "${product.name?.en}" is no longer available`,
          400,
        );
      }

      if (variant.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name?.en}". Available: ${variant.stock}`,
          400,
        );
      }
    }

    const [address, shippingMethod, paymentMethod] = await Promise.all([
      this.addressRepository.findOne({ _id: addressId, user: loggedInUser.id }),
      this.shippingMethodRepository.findOne({
        _id: shippingMethodId,
        isActive: true,
      }),
      this.paymentMethodRepository.findOne({
        _id: paymentMethodId,
        isActive: true,
      }),
    ]);
    if (!address) throw new AppError("Address not found", 404);
    if (!shippingMethod)
      throw new AppError("Shipping method not found or inactive", 404);
    if (!paymentMethod)
      throw new AppError("Payment method not found or inactive", 404);

    const isWalletPayment = paymentMethod.key === "wallet";

    const subtotal = CartPricingService.calculateTotal(cart.items);

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      if (typeof couponCode !== "string" || !couponCode.trim()) {
        throw new AppError("Invalid coupon code", 400);
      }
      appliedCoupon = await this.couponRepository.findOne({
        code: couponCode.trim().toUpperCase(),
      });
      if (!appliedCoupon || !appliedCoupon.isActive) {
        throw new AppError("Invalid coupon code", 400);
      }

      CartPricingService.verifyCoupons(appliedCoupon, loggedInUser);

      if (!appliedCoupon.allowMultiplePerUser) {
        const alreadyUsed = await this.orderRepository.existsByUserAndCoupon(
          loggedInUser.id,
          appliedCoupon.code,
        );
        if (alreadyUsed)
          throw new AppError("You have already used this coupon", 400);
      }
      if (appliedCoupon.minOrderTotal && subtotal < appliedCoupon.minOrderTotal)
        throw new AppError(
          `Minimum order total of ${appliedCoupon.minOrderTotal} is required to use this coupon`,
          400,
        );
      const eligibleItems = cart.items.filter((item) =>
        CartPricingService.checkItemEligibility(item, appliedCoupon),
      );
      discount = CartPricingService.calculateDiscountedTotal(
        eligibleItems,
        appliedCoupon,
      );
    }

    const shippingCost = shippingMethod.price;
    const total = Math.max(0, subtotal - discount) + shippingCost;

    if (isWalletPayment) {
      const wallet = await this.walletRepository.findOne({
        user: loggedInUser.id,
      });
      if (!wallet || wallet.balance < total) {
        throw new AppError("Insufficient wallet balance", 400);
      }
    }

    const orderItems = cart.items.map((item) => ({
      variant: item.variant._id,
      productName: item.variant.product.name,
      image: item.variant.image ?? undefined,
      attributes: (item.variant.attributes ?? []).map((attr) => ({
        attribute: attr.nameSnapshot?.en ?? String(attr.attribute),
        value: String(attr.value),
      })),
      price: item.priceSnapshot,
      quantity: item.quantity,
      total: item.priceSnapshot * item.quantity,
    }));

    const order = await this.orderRepository.create({
      user: loggedInUser.id,
      items: orderItems,
      address: {
        recipientName: address.recipientName,
        recipientMobilePhone: address.recipientMobilePhone,
        country: address.country,
        governorate: address.governorate,
        city: address.city,
        address: address.address,
        postalCode: address.postalCode,
      },
      shippingMethod: {
        id: shippingMethod._id,
        name: shippingMethod.name,
        price: shippingMethod.price,
      },
      paymentMethod: {
        key: paymentMethod.key,
        name: paymentMethod.name?.en ?? paymentMethod.name,
      },
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            discountType: appliedCoupon.discountType,
            discountValue: appliedCoupon.discountValue,
          }
        : undefined,
      pricing: { subtotal, discount, shipping: shippingCost, total },
    });
    const decrementedItems = [];
    for (const item of cart.items) {
      const updated = await this.variantRepository.decrementStock(
        item.variant._id,
        item.quantity,
      );
      if (!updated) {
        for (const d of decrementedItems)
          await this.variantRepository.incrementStock(d.variantId, d.quantity);
        order.status = "cancelled";
        await this.orderRepository.save(order);
        throw new AppError(
          "Stock ran out for one of the items while placing your order. Please review your cart",
          409,
        );
      }
      decrementedItems.push({
        variantId: item.variant._id,
        quantity: item.quantity,
      });
    }
    const soldCountByProduct = new Map();
    for (const item of cart.items) {
      const productId = item.variant.product?._id ?? item.variant.product;
      if (productId) {
        const key = String(productId);
        soldCountByProduct.set(key, (soldCountByProduct.get(key) ?? 0) + item.quantity);
      }
    }
    for (const [productId, qty] of soldCountByProduct.entries()) {
      await this.productRepository.updateOne(
        { _id: productId },
        { $inc: { soldCount: qty } },
      );
    }

    if (isWalletPayment) {
      try {
        const { transaction } = await this.debitWalletUseCase.execute(
          loggedInUser.id,
          {
            amount: total,
            referenceId: order.orderNumber,
            note: `Payment for order ${order.orderNumber}`,
          },
        );
        order.paymentStatus = "paid";
        order.walletTransactionId = transaction._id;
        await this.orderRepository.save(order);
      } catch (err) {
        for (const d of decrementedItems)
          await this.variantRepository.incrementStock(d.variantId, d.quantity);
        for (const [productId, qty] of soldCountByProduct.entries()) {
          await this.productRepository.updateOne(
            { _id: productId },
            { $inc: { soldCount: -qty } },
          );
        }
        order.status = "cancelled";
        await this.orderRepository.save(order);
        throw err;
      }
    }

    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, {
        $inc: { usedCount: 1 },
      });
    }

    await this.cartRepository.deleteByUser(loggedInUser.id);

    return order;
  }
}

module.exports = PlaceOrderUseCase;
