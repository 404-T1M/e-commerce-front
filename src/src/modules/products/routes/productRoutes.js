const express = require("express");
const productController = require("../controller/productController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const { uploadMultiple } = require("../../../middleware/uploadMultiple");
const router = express.Router();
const controller = new productController();

router.post(
  "/admin/products/add-product",
  protect,
  restrictTo("admin"),
  uploadMultiple("productImages"),
  (req, res, next) => {
    controller.createProduct(req, res, next);
  },
);

router.get("/products/search", controller.searchProducts);

router.get("/products/filter-options", controller.getFilterOptions);

router.get(
  "/admin/products",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.listAllProducts(req, res, next);
  },
);

router.get("/products", (req, res, next) => {
  controller.listAllProducts(req, res, next);
});

router.delete(
  "/admin/products/:productId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteProduct(req, res, next);
  },
);

router.patch(
  "/admin/products/:productId/update",
  protect,
  restrictTo("admin"),
  uploadMultiple("productImages"),
  (req, res, next) => {
    controller.updateProduct(req, res, next);
  },
);

router.patch(
  "/admin/products/:productId/publish",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.publishProduct(req, res, next);
  },
);

router.patch(
  "/admin/products/:productId/unpublish",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.unPublishProduct(req, res, next);
  },
);

router.patch(
  "/admin/products/:productId/restore",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.restoreProduct(req, res, next);
  },
);

router.get("/products/:productId", (req, res, next) => {
  controller.getProduct(req, res, next);
});

router.get(
  "/admin/products/:productId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getProduct(req, res, next);
  },
);

module.exports = router;
