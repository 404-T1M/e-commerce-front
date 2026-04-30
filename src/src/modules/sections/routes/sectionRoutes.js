const express = require("express");
const SectionController = require("../controller/sectionController");
const {
  protect,
  protectOptional,
} = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");

const router = express.Router();
const controller = new SectionController();

router.post(
  "/admin/sections/add-section",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.addSection(req, res, next);
  },
);

router.get(
  "/admin/sections",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.listAllSections(req, res, next);
  },
);

router.delete(
  "/admin/sections/:sectionId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteSection(req, res, next);
  },
);

router.patch(
  "/admin/sections/:sectionId/update",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.updateSection(req, res, next);
  },
);

router.get("/sections/home-page", protectOptional, (req, res, next) => {
  controller.getHomePageSections(req, res, next);
});

router.get("/products/:productId/similar-products-section", (req, res, next) => {
  controller.getSimilarProductsSection(req, res, next);
});

module.exports = router;