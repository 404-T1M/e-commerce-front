const userRepository = require("../repositories/userRepository");
const adminGroupRepository = require("../../administratorsGroup/repositories/administratorsGroupRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const ListUserResponseDTO = require("../DTO/ListUserResponseDTO");

class adminListUsersUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.adminGroupRepo = new adminGroupRepository();
  }
  async execute(loggedInUser, filter) {
    await assertAdminPermission(loggedInUser, "users.list");
    const query = { ...filter };
    query.page = Number(filter.page) || 1;
    query.limit = Number(filter.limit) || 10;

    const sortMap = {
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };
    query.sort = sortMap[filter.sort] || { createdAt: -1 };

    const [users, total] = await Promise.all([
      this.userRepo.find(query),
      this.userRepo.count(query),
    ]);
    return {
      users: users.map((userItem) => new ListUserResponseDTO(userItem)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}

module.exports = adminListUsersUseCase;
