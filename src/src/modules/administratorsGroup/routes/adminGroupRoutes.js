const express = require("express");
const adminGroupController = require("../controllers/adminGroupController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");

const router = express.Router();
const controller = new adminGroupController();

router.get(
  "/all-permissions",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.listAllPermissions(req, res, next);
  },
);

router.post(
  "/add-admin-group",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.addAdminGroup(req, res, next);
  },
);

router.get("/admin-groups", protect, restrictTo("admin"), (req, res, next) => {
  controller.listAllAdminGroups(req, res, next);
});

router.patch(
  "/admin-groups/:adminGroupId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.updateAdminGroups(req, res, next);
  },
);

router.delete(
  "/admin-groups/:adminGroupId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteAdminGroups(req, res, next);
  },
);

module.exports = router;
