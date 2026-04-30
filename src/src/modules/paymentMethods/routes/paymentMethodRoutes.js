const express = require("express");
const PaymentMethodController = require("../controllers/paymentMethodController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const { uploadSingle } = require("../../../middleware/uploadSingle");

const router = express.Router();
const controller = new PaymentMethodController();

router.post(
  "/admin/payment-methods/add",
  protect,
  restrictTo("admin"),
  uploadSingle("paymentMethodImage"),
  (req, res, next) => {
    controller.createPaymentMethod(req, res, next);
  },
);

router.get(
  "/admin/payment-methods",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.listAdminPaymentMethods(req, res, next);
  },
);

router.post(
  "/admin/payment-methods/:paymentMethodId/update",
  protect,
  restrictTo("admin"),
  uploadSingle("paymentMethodImage"),
  (req, res, next) => {
    controller.updatePaymentMethod(req, res, next);
  },
);

router.delete(
  "/admin/payment-methods/:paymentMethodId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deletePaymentMethod(req, res, next);
  },
);

router.get("/payment-methods", protect, (req, res, next) => {
  controller.listPublicPaymentMethods(req, res, next);
});

module.exports = router;
