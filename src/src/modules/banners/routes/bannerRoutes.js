const express = require("express");
const BannerController = require("../controller/bannerController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const { uploadSingle } = require("../../../middleware/uploadSingle");
const router = express.Router();
const controller = new BannerController();

router.post(
  "/admin/banners/add-banner",
  protect,
  restrictTo("admin"),
  uploadSingle("bannerImage"),
  (req, res, next) => {
    controller.addBanner(req, res, next);
  },
);

router.get("/admin/banners", protect, restrictTo("admin"), (req, res, next) => {
  controller.listAllBanners(req, res, next);
});

router.get(
  "/admin/banners/:bannerId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getBanner(req, res, next);
  },
);

router.patch(
  "/admin/banners/:bannerId/update",
  protect,
  restrictTo("admin"),
  uploadSingle("bannerImage"),
  (req, res, next) => {
    controller.updateBanner(req, res, next);
  },
);

router.delete(
  "/admin/banners/:bannerId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteBanner(req, res, next);
  },
);

module.exports = router;
