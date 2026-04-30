const AppError = require("../errors/appError");
const adminGroupRepository = require("../../modules/administratorsGroup/repositories/administratorsGroupRepository");
const adminGroupRepo = new adminGroupRepository();

exports.assertAdminPermission = async (loggedInUser, permission) => {
  if (!loggedInUser) {
    throw new AppError("Unauthenticated", 401);
  }
  const adminGroupOfLoggedInAdmin = await adminGroupRepo.findOne({
    _id: loggedInUser.adminGroup,
  });

  if (!adminGroupOfLoggedInAdmin) {
    throw new AppError("Admin group not found", 403);
  }

  if (
    loggedInUser.role !== "admin" ||
    !adminGroupOfLoggedInAdmin.permissions.includes(permission)
  ) {
    throw new AppError("Forbidden", 403);
  }
};
