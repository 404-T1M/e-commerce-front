const AppError = require("../../../core/errors/appError");
const CartRepository = require("../repositories/cartRepository");
const CouponRepository = require("../../coupons/repositories/couponRepository");
const CartPricingService = require("../../../shared/services/cartService");

class ApplyCouponUseCase {
  constructor() {
    this.cartRepository = new CartRepository();
    this.couponRepository = new CouponRepository();
  }

  async execute(loggedInUser, couponCode) {
    const cart = await this.cartRepository.findByUser(loggedInUser.id);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const pricesChanged = CartPricingService.refreshPrices(cart);
    if (pricesChanged) {
      await this.cartRepository.save(cart);
    }

    if (!couponCode || typeof couponCode !== "string" || !couponCode.trim()) {
      throw new AppError("Coupon code is required", 400);
    }
    const coupon = await this.couponRepository.findOne({
      code: couponCode.trim().toUpperCase(),
    });
    if (!coupon || !coupon.isActive) {
      throw new AppError("Invalid coupon code", 400);
    }
    CartPricingService.verifyCoupons(coupon, loggedInUser);

    const cartTotal = CartPricingService.calculateTotal(cart.items);
    if (coupon.minOrderTotal && cartTotal < coupon.minOrderTotal) {
      throw new AppError(
        `Minimum order total of ${coupon.minOrderTotal} is required to use this coupon`,
        400,
      );
    }

    const allowedItems = cart.items.filter((item) =>
      CartPricingService.checkItemEligibility(item, coupon),
    );

    const discount = CartPricingService.calculateDiscountedTotal(
      allowedItems,
      coupon,
    );

    cart.coupon = { code: coupon.code };
    await this.cartRepository.save(cart);

    const hasRestrictions =
      coupon.applicableProducts.length > 0 ||
      coupon.applicableCategories.length > 0;

    const result = {
      subtotal: cartTotal,
      discount,
      total: Math.max(0, cartTotal - discount),
    };

    if (hasRestrictions) {
      result.eligibleItems = allowedItems.map((item) => ({
        variantId: item.variant._id,
        productName: item.variant.product.name,
        price: item.priceSnapshot,
        quantity: item.quantity,
      }));
    }

    return result;
  }
}

module.exports = ApplyCouponUseCase;
