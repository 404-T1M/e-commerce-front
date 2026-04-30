const express = require("express");
const AnalyticsController = require("../controllers/analyticsController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");

const router = express.Router();
const controller = new AnalyticsController();

// Overview
router.get(
  "/admin/analytics/overview",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getOverview(req, res, next);
  }
);

// Profit chart (12 months)
router.get(
  "/admin/analytics/profit-chart",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getProfitChart(req, res, next);
  }
);

// Daily report
router.get(
  "/admin/analytics/reports/daily",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getDailyReport(req, res, next);
  }
);

// Profit report by date range
router.get(
  "/admin/analytics/reports/profit",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getProfitReport(req, res, next);
  }
);

// Customer report
router.get(
  "/admin/analytics/reports/customers",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getCustomerReport(req, res, next);
  }
);

// Product stats report
router.get(
  "/admin/analytics/reports/products",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getProductStats(req, res, next);
  }
);

// Coupon stats report
router.get(
  "/admin/analytics/reports/coupons",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getCouponStats(req, res, next);
  }
);

module.exports = router;
