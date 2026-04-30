const express = require("express");
const CouponController = require("../controllers/couponController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const router = express.Router();
const controller = new CouponController();

router.post(
  "/admin/coupons/add-coupon",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.createCoupon(req, res, next);
  },
);

router.get("/admin/coupons", protect, restrictTo("admin"), (req, res, next) => {
  controller.ListAllCoupons(req, res, next);
});

router.get(
  "/admin/coupons/:couponId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getCoupon(req, res, next);
  },
);

router.post(
  "/admin/coupons/:couponId/update",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.updateCoupon(req, res, next);
  },
);

router.delete(
  "/admin/coupons/:couponId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteCoupon(req, res, next);
  },
);

module.exports = router;
