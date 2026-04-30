const userRepository = require("../repositories/userRepository");
const User = require("../entities/userEntity");
const LoginResponseDTO = require("../DTO/LoginResponseDTO");
const AppError = require("../../../core/errors/appError");
const { comparePassword } = require("../../../shared/utils/passwordHasher");
const { createToken } = require("../../../shared/utils/createToken");
class LoginUseCase {
  constructor() {
    this.userRepo = new userRepository();
  }
  async execute(data) {
    let user;
    if (data.mobilePhone && !data.email) {
      user = await this.userRepo.findByPhone(data.mobilePhone, {
        withPassword: true,
      });
    } else if (!data.mobilePhone && data.email) {
      user = await this.userRepo.findByEmail(data.email, {
        withPassword: true,
      });
    } else {
      throw new AppError("Use Email Or Mobile Phone To login", 400);
    }

    if (!user) {
      throw new AppError("User Not Exist", 400);
    }
    const matchedPassword = await comparePassword(data.password, user.password);
    if (!matchedPassword) {
      throw new AppError("Wrong Email Or Password", 400);
    }

    const userEntity = new User(user);
    userEntity.deletedUser();
    userEntity.activeUser();
    userEntity.verifiedEmail();

    const token = createToken(user._id, user.role, user.tokenVersion);
    return new LoginResponseDTO(user, token);
  }
}

module.exports = LoginUseCase;
