const AppError = require("../../../core/errors/appError");
const CouponRepository = require("../repositories/couponRepository");
const CouponResponseDTO = require("../DTO/couponResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class DeleteCouponUseCase {
  constructor() {
    this.couponRepo = new CouponRepository();
  }

  async execute(loggedInUser, couponId) {
    await assertAdminPermission(loggedInUser, "coupons.delete");

    const coupon = await this.couponRepo.findOne({ _id: couponId });
    if (!coupon) {
      throw new AppError("Coupon Not Founded", 404);
    }

    await this.couponRepo.deleteOne({ _id: coupon._id });
  }
}
module.exports = DeleteCouponUseCase;
