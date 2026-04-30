const adminGroupPermission = require("../../../shared/utils/adminGroupPermission");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class ListAllPermissionsUseCase {
  constructor() {}
  async execute(loggedInUser) {
    await assertAdminPermission(loggedInUser, "adminGroups.list");
    const permissions = await adminGroupPermission.getAllPermissions();
    return {
      permissions,
    };
  }
}

module.exports = ListAllPermissionsUseCase;
