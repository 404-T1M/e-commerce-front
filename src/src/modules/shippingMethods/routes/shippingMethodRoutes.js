const express = require("express");
const ShippingMethodController = require("../controllers/shippingMethodController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const { uploadSingle } = require("../../../middleware/uploadSingle");

const router = express.Router();
const controller = new ShippingMethodController();

router.post(
  "/admin/shipping-methods/add",
  protect,
  restrictTo("admin"),
  uploadSingle("shippingMethodImage"),
  (req, res, next) => {
    controller.createShippingMethod(req, res, next);
  },
);

router.get(
  "/admin/shipping-methods",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.listAdminShippingMethods(req, res, next);
  },
);

router.post(
  "/admin/shipping-methods/:shippingMethodId/update",
  protect,
  restrictTo("admin"),
  uploadSingle("shippingMethodImage"),
  (req, res, next) => {
    controller.updateShippingMethod(req, res, next);
  },
);

router.delete(
  "/admin/shipping-methods/:shippingMethodId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteShippingMethod(req, res, next);
  },
);


router.get("/shipping-methods", protect, (req, res, next) => {
  controller.listPublicShippingMethods(req, res, next);
});

module.exports = router;
