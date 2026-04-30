const express = require("express");
const usersController = require("../controllers/usersController");
const { protect } = require("../../../middleware/protectedMiddleware");
const { restrictTo } = require("../../../middleware/roleMiddleware");
const { uploadSingle } = require("../../../middleware/uploadSingle");

const router = express.Router();
const controller = new usersController();

router.post("/auth/register", (req, res, next) => {
  controller.register(req, res, next);
});

router.post("/auth/login", (req, res, next) => {
  controller.login(req, res, next);
});

router.get("/auth/me", protect, (req, res, next) => {
  controller.getMe(req, res, next);
});

router.patch(
  "/auth/update-my-info",
  protect,
  uploadSingle("profileImage"),
  (req, res, next) => {
    controller.updateMyInfo(req, res, next);
  },
);

router.post("/auth/verify-email", (req, res, next) => {
  controller.verifyEmail(req, res, next);
});

router.post("/auth/resend-verification-code", (req, res, next) => {
  controller.resendVerificationCode(req, res, next);
});

router.post("/auth/forgot-password", (req, res, next) => {
  controller.forgotPassword(req, res, next);
});

router.patch("/auth/reset-password/:token", (req, res, next) => {
  controller.ResetPassword(req, res, next);
});

router.post("/admin/auth/login", (req, res, next) => {
  controller.adminLogin(req, res, next);
});

router.get("/admin/users", protect, restrictTo("admin"), (req, res, next) => {
  controller.listAllUsers(req, res, next);
});

router.get(
  "/admin/users/:userId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.getUserDetails(req, res, next);
  },
);

router.patch(
  "/admin/users/:userId/update-status",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.changeUserStatus(req, res, next);
  },
);

router.delete(
  "/admin/users/:customerId/delete",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteUser(req, res, next);
  },
);

router.get("/admin/admins", protect, restrictTo("admin"), (req, res, next) => {
  controller.listAllAdmins(req, res, next);
});

router.post("/admin/admins", protect, restrictTo("admin"), (req, res, next) => {
  controller.addAdmin(req, res, next);
});

router.patch(
  "/admin/admins/:adminId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.updateAdmin(req, res, next);
  },
);

router.delete(
  "/admin/admins/:adminId",
  protect,
  restrictTo("admin"),
  (req, res, next) => {
    controller.deleteAdmin(req, res, next);
  },
);

module.exports = router;
