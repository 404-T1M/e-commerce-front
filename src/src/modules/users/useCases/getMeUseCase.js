const userRepository = require("../repositories/userRepository");
const AppError = require("../../../core/errors/appError");
const User = require("../entities/userEntity");
const ListUserResponseDTO = require("../DTO/ListUserResponseDTO");

class GetMeUseCase {
  constructor() {
    this.userRepo = new userRepository();
  }
  async execute(loggedInUser) {
    const result = await this.userRepo.findOne({ _id: loggedInUser.id });

    if (!result) {
      throw new AppError("User Not Found", 404);
    }

    const userEntity = new User(result);
    userEntity.deletedUser();

    return new ListUserResponseDTO(result);
  }
}

module.exports = GetMeUseCase;
