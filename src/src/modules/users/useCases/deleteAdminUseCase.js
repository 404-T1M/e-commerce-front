const userRepository = require("../repositories/userRepository");
const adminGroupRepository = require("../../administratorsGroup/repositories/administratorsGroupRepository");
const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class deleteAdminUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.adminGroupRepo = new adminGroupRepository();
  }
  async execute(loggedInUser, adminId) {
    await assertAdminPermission(
      loggedInUser,
      "users.delete",
    );

    const admin = await this.userRepo.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      throw new AppError("Admin Not Found", 404);
    }

    await this.userRepo.deleteOne({ _id: admin._id, role: "admin" });
  }
}
module.exports = deleteAdminUseCase;
