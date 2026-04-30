const CouponRepository = require("../repositories/couponRepository");
const CouponResponseDTO = require("../DTO/couponResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class GetAllCouponUseCase {
  constructor() {
    this.couponRepo = new CouponRepository();
  }

  async execute(loggedInUser, filter) {
    await assertAdminPermission(loggedInUser, "coupons.list");

    let query = {};

    if (filter.isActive != null && filter.isActive !== "") {
      query.isActive = filter.isActive === "true" || filter.isActive === true;
    }
    if (filter.code) {
      query.code = { $regex: filter.code, $options: "i" };
    }

    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const sort = filter.sort || { createdAt: -1 };

    const [coupons, total] = await Promise.all([
      this.couponRepo.find(query, sort, page, limit, { populateUsers: true }),
      this.couponRepo.count(query),
    ]);

    return {
      coupons: coupons.map((coupon) => new CouponResponseDTO(coupon)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
module.exports = GetAllCouponUseCase;
