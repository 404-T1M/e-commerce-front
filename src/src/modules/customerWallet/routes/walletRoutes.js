const express = require("express");
const WalletController = require("../controller/walletController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");

const router = express.Router();
const controller = new WalletController();

router.get("/wallet", protect, (req, res, next) => {
  controller.getMyWallet(req, res, next);
});

router.get("/wallet/transactions", protect, (req, res, next) => {
  controller.getMyTransactions(req, res, next);
});

router.post("/wallet/top-up", protect, (req, res, next) => {
  controller.initiateTopUp(req, res, next);
});

router.get(
  "/admin/wallet/user/:userId/transactions",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.adminGetUserTransactions(req, res, next);
  },
);

router.post(
  "/admin/wallet/credit",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.adminCreditWallet(req, res, next);
  },
);

module.exports = router;
