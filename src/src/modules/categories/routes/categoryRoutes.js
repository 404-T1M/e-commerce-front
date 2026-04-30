const express = require("express");
const categoryController = require("../controllers/categoryController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const { uploadSingle } = require("../../../middleware/uploadSingle");
const router = express.Router();
const controller = new categoryController();

router.post(
  "/admin/categories/add-category",
  protect,
  restrictTo("admin"),
  uploadSingle("categoryImage"),
  (req, res, next) => {
    controller.createCategory(req, res, next);
  },
);

router.get(
  "/admin/categories",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.adminListAllCategories(req, res, next);
  },
);

router.get("/categories", (req, res, next) => {
  controller.usersListAllCategories(req, res, next);
});

router.get("/categories/:categoryId", (req, res, next) => {
  controller.getCategory(req, res, next);
});

router.delete(
  "/admin/categories/:categoryId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteCategory(req, res, next);
  },
);

router.patch(
  "/admin/categories/:categoryId/update",
  protect,
  restrictTo("admin"),
  uploadSingle("categoryImage"),
  (req, res, next) => {
    controller.updateCategory(req, res, next);
  },
);

router.patch(
  "/admin/categories/:categoryId/unpublish",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.unPublishCategory(req, res, next);
  },
);

router.patch(
  "/admin/categories/:categoryId/publish",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.publishCategory(req, res, next);
  },
);

router.patch(
  "/admin/categories/:categoryId/restore",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.restoreDeletedCategory(req, res, next);
  },
);

module.exports = router;
