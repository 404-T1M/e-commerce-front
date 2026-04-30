const userRepository = require("../repositories/userRepository");
const AppError = require("../../../core/errors/appError");
const User = require("../entities/userEntity");
const ListUserResponseDTO = require("../DTO/ListUserResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class getUserDetailsUseCase {
  constructor() {
    this.userRepo = new userRepository();
  }
  async execute(loggedInUser, userId) {
    await assertAdminPermission(loggedInUser, "users.create");

    const result = await this.userRepo.findOne({ _id: userId });

    if (!result) {
      throw new AppError("User Not Found", 404);
    }

    const userEntity = new User(result);
    userEntity.deletedUser();

    return new ListUserResponseDTO(result);
  }
}

module.exports = getUserDetailsUseCase;
