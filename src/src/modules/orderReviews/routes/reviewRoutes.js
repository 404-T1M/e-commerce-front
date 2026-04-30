const express = require("express");
const ReviewController = require("../controllers/reviewController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");

const router = express.Router();
const controller = new ReviewController();

router.get("/products/:productId/reviews", protect, (req, res, next) => {
  controller.getProductReviews(req, res, next);
});

router.post(
  "/products/:productId/reviews/add-review",
  protect,
  (req, res, next) => {
    controller.addReview(req, res, next);
  },
);

router.patch("/reviews/:id/update", protect, (req, res, next) => {
  controller.updateReview(req, res, next);
});

router.delete("/reviews/:id", protect, (req, res, next) => {
  controller.deleteReview(req, res, next);
});

router.get("/admin/reviews", protect, restrictTo("admin"), (req, res, next) => {
  controller.adminGetReviews(req, res, next);
});

router.patch(
  "/admin/reviews/:id/status",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.adminUpdateReviewStatus(req, res, next);
  },
);

router.delete(
  "/admin/reviews/:id",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.adminDeleteReview(req, res, next);
  },
);

module.exports = router;
