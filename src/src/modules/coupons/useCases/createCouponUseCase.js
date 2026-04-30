const AppError = require("../../../core/errors/appError");
const CouponRepository = require("../repositories/couponRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class CreateCouponUseCase {
  constructor() {
    this.couponRepo = new CouponRepository();
  }
  async execute(loggedInUser, body) {
    await assertAdminPermission(loggedInUser, "coupons.create");
    let {
      code,
      discountType,
      discountValue,
      startsAt,
      endsAt,
      minOrderTotal,
      maxDiscountAmount,
      applicableCategories = [],
      applicableProducts = [],
      allowedUsers = [],
      usageLimit,
      allowMultiplePerUser,
    } = body;

    if (!code || !discountType || discountValue == null) {
      throw new AppError(
        "Coupon Code, discountType and discountValue are Required",
        404,
      );
    }

    if (
      discountType === "percentage" &&
      (discountValue > 100 || discountValue <= 0)
    ) {
      throw new AppError("Discount Value Should Be Between 0 and 100", 400);
    }

    if (discountType === "fixed" && discountValue <= 0) {
      throw new AppError("Discount Value Should Be More Than 0", 400);
    }

    if (
      new Date(startsAt) &&
      new Date(endsAt) &&
      new Date(startsAt) >= new Date(endsAt)
    ) {
      throw new AppError("End Date Must Be After Start Date", 400);
    }

    if (
      (minOrderTotal && minOrderTotal < 0) ||
      (maxDiscountAmount && maxDiscountAmount < 0) ||
      (usageLimit && usageLimit < 0)
    ) {
      throw new AppError(
        "MinOrderTotal ,MaxDiscountAmount and UsageLimit Should Be More Than 0",
        400,
      );
    }

    const existingCoupon = await this.couponRepo.findOne({
      code: code.toUpperCase(),
    });
    if (existingCoupon) {
      throw new AppError("Coupon Code Already Exists", 400);
    }

    const coupon = await this.couponRepo.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      startsAt,
      endsAt,
      minOrderTotal,
      maxDiscountAmount,
      applicableCategories,
      applicableProducts,
      allowedUsers,
      usageLimit,
      allowMultiplePerUser,
      createdBy: loggedInUser.id,
    });

    return coupon;
  }
}

module.exports = CreateCouponUseCase;
