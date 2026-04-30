const adminGroupRepository = require("../../administratorsGroup/repositories/administratorsGroupRepository");
const AppError = require("../../../core/errors/appError");
const adminGroupResponseDTO = require("../DTO/adminGroupResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class UpdateAdminGroupUseCase {
  constructor() {
    this.adminGroupRepo = new adminGroupRepository();
  }
  async execute(loggedInUser, body, adminGroupId) {
    await assertAdminPermission(loggedInUser, "adminGroups.update");

    const adminGroup = await this.adminGroupRepo.findOne({
      _id: adminGroupId,
    });
    if (!adminGroup) {
      throw new AppError("Admin Group Not Found", 404);
    }

    const savedAdminGroup = await this.adminGroupRepo.updateOne(
      { _id: adminGroupId },
      {
        name: body.name ?? adminGroup.name,
        permissions: body.permissions ?? adminGroup.permissions,
      },
    );
    return new adminGroupResponseDTO(savedAdminGroup);
  }
}

module.exports = UpdateAdminGroupUseCase;
