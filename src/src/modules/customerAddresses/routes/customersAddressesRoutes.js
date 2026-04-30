const express = require("express");
const AddressController = require("../controller/customerAddressesController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const router = express.Router();
const controller = new AddressController();

router.post(
  "/admin/addresses/add-address",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.createAddress(req, res, next);
  },
);

router.post(
  "/addresses/add-address",
  protect,
  restrictTo("user"),
  (req, res, next) => {
    controller.createAddress(req, res, next);
  },
);

router.get(
  "/admin/addresses",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.ListAllAddresses(req, res, next);
  },
);

router.get(
  "/admin/addresses/:customerId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.listCustomerAddresses(req, res, next);
  },
);

router.get(
  "/admin/addresses/:customerId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.listCustomerAddresses(req, res, next);
  },
);

router.get("/myAddresses", protect, restrictTo("user"), (req, res, next) => {
  controller.listCustomerAddresses(req, res, next);
});

router.post(
  "/admin/addresses/:addressId/update",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.updateAddress(req, res, next);
  },
);

router.post(
  "/addresses/:addressId/update",
  protect,
  restrictTo("user"),
  (req, res, next) => {
    controller.updateAddress(req, res, next);
  },
);

router.delete(
  "/admin/addresses/:addressId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteAddress(req, res, next);
  },
);

router.delete(
  "/addresses/:addressId/delete",
  protect,
  restrictTo("user"),
  (req, res, next) => {
    controller.deleteAddress(req, res, next);
  },
);

module.exports = router;
