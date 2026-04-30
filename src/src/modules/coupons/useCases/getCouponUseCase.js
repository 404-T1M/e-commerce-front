const AppError = require("../../../core/errors/appError");
const CouponRepository = require("../repositories/couponRepository");
const CouponResponseDTO = require("../DTO/couponResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class GetCouponUseCase {
  constructor() {
    this.couponRepo = new CouponRepository();
  }

  async execute(loggedInUser, couponId) {
    await assertAdminPermission(loggedInUser, "coupons.list");

    const coupon = await this.couponRepo.findOne(
      { _id: couponId },
      { populateCategories: true, populateProducts: true, populateUsers: true },
    );

    if (!coupon) {
      throw new AppError("Coupon Not Founded", 404);
    }
    return new CouponResponseDTO(coupon);
  }
}
module.exports = GetCouponUseCase;
