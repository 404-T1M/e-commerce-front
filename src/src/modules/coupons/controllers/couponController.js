const catchAsync = require("../../../shared/utils/catchAsync");
const CreateCouponUseCase = require("../useCases/createCouponUseCase");
const GetAllCouponsUseCase = require("../useCases/getAllCouponsUseCase");
const GetCouponUseCase = require("../useCases/getCouponUseCase");
const UpdateCouponUseCase = require("../useCases/updateCouponUseCase");
const DeleteCouponUseCase = require("../useCases/deleteCouponUseCase");

class AttributeController {
  constructor() {
    this.createCouponUseCase = new CreateCouponUseCase();
    this.getAllCouponsUseCase = new GetAllCouponsUseCase();
    this.getCouponUseCase = new GetCouponUseCase();
    this.updateCouponUseCase = new UpdateCouponUseCase();
    this.deleteCouponUseCase = new DeleteCouponUseCase();
  }

  createCoupon = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;

    const coupon = await this.createCouponUseCase.execute(loggedInUser, body);

    res.status(201).json({
      message: "Coupon Created Successfully",
      coupon,
    });
  });

  updateCoupon = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { couponId } = req.params;
    const body = req.body;

    const coupon = await this.updateCouponUseCase.execute(
      loggedInUser,
      couponId,
      body,
    );

    res.status(201).json({
      message: "Coupon Created Successfully",
      coupon,
    });
  });

  ListAllCoupons = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      code: req.query.code,
      isActive: req.query.isActive,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 15,
      sort: req.query.sort,
    };

    const result = await this.getAllCouponsUseCase.execute(
      loggedInUser,
      filter,
    );
    res.status(200).json({
      coupons: result.coupons,
      meta: result.meta,
    });
  });

  getCoupon = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { couponId } = req.params;

    const coupon = await this.getCouponUseCase.execute(loggedInUser, couponId);
    res.status(200).json({
      coupon,
    });
  });

  deleteCoupon = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { attributeId: couponId } = req.params;

    await this.deleteCouponUseCase.execute(loggedInUser, couponId);

    res.status(200).json({
      message: "Coupon Deleted Successfully",
    });
  });
}

module.exports = AttributeController;
