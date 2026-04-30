const express = require("express");
const CartController = require("../controller/cartController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const router = express.Router();
const controller = new CartController();

router.post("/cart/add-to-cart", protect, (req, res, next) => {
  controller.addToCart(req, res, next);
});

router.patch("/cart/update", protect, (req, res, next) => {
  controller.updateCart(req, res, next);
});

router.get("/cart", protect, (req, res, next) => {
  controller.getCart(req, res, next);
});

router.delete("/cart/delete", protect, (req, res, next) => {
  controller.deleteItem(req, res, next);
});

router.post("/cart/apply-coupon", protect, (req, res, next) => {
  controller.applyCoupon(req, res, next);
});

module.exports = router;
