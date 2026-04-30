const adminGroupRepository = require("../../administratorsGroup/repositories/administratorsGroupRepository");
const userRepository = require("../../users/repositories/userRepository");
const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class DeleteAdminGroupUseCase {
  constructor() {
    this.adminGroupRepo = new adminGroupRepository();
    this.userRepo = new userRepository();
  }

  async execute(loggedInUser, adminGroupId) {
    await assertAdminPermission(loggedInUser, "adminGroups.delete");

    const group = await this.adminGroupRepo.findOne({ _id: adminGroupId });
    if (!group) {
      throw new AppError("Admin group not found", 404);
    }

    const adminsCount = await this.userRepo.count({
      adminGroup: adminGroupId,
      role: "admin",
    });

    if (adminsCount > 0) {
      throw new AppError(
        "Admin group has assigned admins. Reassign them before deletion.",
        409,
      );
    }

    await this.adminGroupRepo.deleteOne({ _id: adminGroupId });
  }
}

module.exports = DeleteAdminGroupUseCase;
