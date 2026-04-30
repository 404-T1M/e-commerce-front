const userRepository = require("../repositories/userRepository");
const adminGroupRepository = require("../../administratorsGroup/repositories/administratorsGroupRepository");
const AppError = require("../../../core/errors/appError");
const ListUserResponseDTO = require("../DTO/ListUserResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
class updateAdminUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.adminGroupRepo = new adminGroupRepository();
  }
  async execute(loggedInUser, adminGroupId, adminId) {
    await assertAdminPermission(loggedInUser, "users.update");

    const admin = await this.userRepo.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      throw new AppError("Admin Not Founded", 404);
    }

    const adminGroup = await this.adminGroupRepo.findOne({
      _id: adminGroupId,
    });
    if (!adminGroup) {
      throw new AppError("Admin Group Not Founded", 404);
    }

    const savedAdmin = await this.userRepo.updateOne(
      { _id: adminId },
      { adminGroup: adminGroupId },
    );
    return new ListUserResponseDTO(savedAdmin);
  }
}

module.exports = updateAdminUseCase;
