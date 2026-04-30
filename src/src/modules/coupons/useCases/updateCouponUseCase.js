const AppError = require("../../../core/errors/appError");
const CouponRepository = require("../repositories/couponRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class UpdateCouponUseCase {
  constructor() {
    this.couponRepo = new CouponRepository();
  }

  async execute(loggedInUser, couponId, body) {
    await assertAdminPermission(loggedInUser, "coupons.update");

    const coupon = await this.couponRepo.findOne({ _id: couponId });
    if (!coupon) {
      throw new AppError("Coupon Not Found", 404);
    }

    const updates = {};

    if (body.code) {
      const code = body.code.toUpperCase();
      const existing = await this.couponRepo.findOne({ code });
      if (existing && existing._id.toString() !== couponId) {
        throw new AppError("Coupon Code Already Exists", 400);
      }
      updates.code = code;
    }

    if (body.discountType) {
      if (!["percentage", "fixed"].includes(body.discountType)) {
        throw new AppError("Invalid discountType", 400);
      }
      updates.discountType = body.discountType;
    }

    if (body.discountValue != null) {
      const type = body.discountType ?? coupon.discountType;

      if (
        type === "percentage" &&
        (body.discountValue <= 0 || body.discountValue > 100)
      ) {
        throw new AppError(
          "Percentage discount must be between 1 and 100",
          400,
        );
      }

      if (type === "fixed" && body.discountValue <= 0) {
        throw new AppError("Fixed discount must be greater than 0", 400);
      }

      updates.discountValue = body.discountValue;
    }

    const startsAt = body.startsAt ?? coupon.startsAt;
    const endsAt = body.endsAt ?? coupon.endsAt;

    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      throw new AppError("End Date Must Be After Start Date", 400);
    }

    if (body.startsAt !== undefined) updates.startsAt = body.startsAt;
    if (body.endsAt !== undefined) updates.endsAt = body.endsAt;

    if (body.minOrderTotal != null) {
      if (body.minOrderTotal < 0) {
        throw new AppError("minOrderTotal must be >= 0", 400);
      }
      updates.minOrderTotal = body.minOrderTotal;
    }

    if (body.maxDiscountAmount != null) {
      if (body.maxDiscountAmount < 0) {
        throw new AppError("maxDiscountAmount must be >= 0", 400);
      }
      updates.maxDiscountAmount = body.maxDiscountAmount;
    }

    if (body.usageLimit != null) {
      if (body.usageLimit < 0) {
        throw new AppError("usageLimit must be >= 0", 400);
      }
      updates.usageLimit = body.usageLimit;
    }

    if (Array.isArray(body.applicableCategories)) {
      updates.applicableCategories = body.applicableCategories;
    }

    if (Array.isArray(body.applicableProducts)) {
      updates.applicableProducts = body.applicableProducts;
    }

    if (Array.isArray(body.allowedUsers)) {
      updates.allowedUsers = body.allowedUsers;
    }

    if (body.allowMultiplePerUser != null) {
      updates.allowMultiplePerUser = body.allowMultiplePerUser;
    }

    if (body.isActive != null) {
      updates.isActive = body.isActive;
    }

    const updatedCoupon = await this.couponRepo.updateOne(
      { _id: couponId },
      updates,
    );

    return updatedCoupon;
  }
}

module.exports = UpdateCouponUseCase;
