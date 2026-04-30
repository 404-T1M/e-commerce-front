const adminGroupRepository = require("../../administratorsGroup/repositories/administratorsGroupRepository");
const adminGroupResponseDTO = require("../DTO/adminGroupResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class ListAdminGroupsUseCase {
  constructor() {
    this.adminGroupRepo = new adminGroupRepository();
  }
  async execute(loggedInUser, filter = {}) {
    await assertAdminPermission(loggedInUser, "adminGroups.list");

    const pagination = {
      page: Number(filter.page) || 1,
      limit: Number(filter.limit) || 10,
    };

    const query = {
      ...filter,
      ...pagination,
    };

    const [adminGroups, total] = await Promise.all([
      this.adminGroupRepo.find(query),
      this.adminGroupRepo.count(query),
    ]);

    return {
      adminGroups: adminGroups.map((group) => new adminGroupResponseDTO(group)),
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }
}

module.exports = ListAdminGroupsUseCase;
