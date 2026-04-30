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
    const admin = await this.userRepo.findOne(
      {
        email: data.email,
        role: "admin",
      },
      { withPassword: true },
    );

    if (!admin) {
      throw new AppError("Admin Not Exist", 400);
    }

    const matchedPassword = await comparePassword(
      data.password,
      admin.password,
    );
    if (!matchedPassword) {
      throw new AppError("Wrong Email Or Password", 400);
    }

    const userEntity = new User(admin);
    userEntity.deletedUser();
    userEntity.activeUser();
    userEntity.verifiedEmail();

    const token = createToken(admin._id, admin.role, admin.tokenVersion);
    return new LoginResponseDTO(admin, token);
  }
}

module.exports = LoginUseCase;
