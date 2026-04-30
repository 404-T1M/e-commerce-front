const express = require("express");
const OrderController = require("../controller/orderController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");

const router = express.Router();
const controller = new OrderController();

router.post("/orders", protect, (req, res, next) => {
  controller.placeOrder(req, res, next);
});

router.get("/orders", protect, (req, res, next) => {
  controller.getMyOrders(req, res, next);
});

router.get("/orders/:id", protect, (req, res, next) => {
  controller.getOrderById(req, res, next);
});

router.patch("/orders/:id/cancel", protect, (req, res, next) => {
  controller.cancelOrder(req, res, next);
});

router.get("/admin/orders", protect, restrictTo("admin"), (req, res, next) => {
  controller.getAllOrders(req, res, next);
});

router.patch(
  "/admin/orders/:id/status",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.updateOrderStatus(req, res, next);
  },
);

module.exports = router;
