const adminGroupRepository = require("../repositories/administratorsGroupRepository");
const adminGroup = require("../entities/adminGroupEntity");
const adminGroupResponseDTO = require("../DTO/adminGroupResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class createAdminGroup {
  constructor() {
    this.adminGroupRepo = new adminGroupRepository();
  }
  async execute(loggedInUser, body) {
    await assertAdminPermission(loggedInUser, "adminGroups.create");
    const adminGroupData = new adminGroup(body);
    const savedAdminGroup = await this.adminGroupRepo.save(adminGroupData);
    return new adminGroupResponseDTO(savedAdminGroup);
  }
}

module.exports = createAdminGroup;
