const express = require("express");
const productVariantsController = require("../controller/productVariantController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const { uploadSingle } = require("../../../middleware/uploadSingle");
const { uploadMultiple } = require("../../../middleware/uploadMultiple");

const router = express.Router();
const controller = new productVariantsController();

router.post(
  "/admin/products/:productId/variants/add-variant",
  protect,
  restrictTo("admin"),
  uploadMultiple("productImages"),
  (req, res, next) => {
    controller.createVariants(req, res, next);
  },
);

router.patch(
  "/admin/products/variants/:variantId/update",
  protect,
  restrictTo("admin"),
  uploadSingle("productImages"),
  (req, res, next) => {
    controller.updateVariant(req, res, next);
  },
);

router.patch(
  "/admin/products/variants/:variantId/publish-status",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.changePublishStatus(req, res, next);
  },
);

router.delete(
  "/admin/products/variants/:variantId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteVariant(req, res, next);
  },
);

router.patch(
  "/admin/products/variants/:variantId/restore",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.restoreVariant(req, res, next);
  },
);

module.exports = router;
