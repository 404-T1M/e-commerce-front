const express = require("express");
const AttributeController = require("../controller/attributeController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const router = express.Router();
const controller = new AttributeController();

router.post(
  "/admin/attributes/add-attribute",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.createAttribute(req, res, next);
  },
);

router.get(
  "/admin/attributes",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.ListAllAttribute(req, res, next);
  },
);

router.delete(
  "/admin/attributes/:attributeId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteAttribute(req, res, next);
  },
);

module.exports = router;
