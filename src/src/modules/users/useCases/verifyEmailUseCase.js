const userRepository = require("../repositories/userRepository");
const User = require("../entities/userEntity");
const AppError = require("../../../core/errors/appError");
const {
  compareCode,
  codeExpired,
} = require("../../../shared/utils/codeHasher");

class verifyEmailUseCase {
  constructor() {
    this.userRepo = new userRepository();
  }

  async execute(data) {
    const user = await this.userRepo.findByEmail(data.email, {
      withVerificationCode: true,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userEntity = new User(user);
    userEntity.deletedUser();
    userEntity.activeUser();

    if (user.emailVerified) {
      throw new AppError("Email Already verified");
    }

    codeExpired(user.verificationCodeExpire);

    const matchedCode = await compareCode(data.code, user.verificationCode);
    if (!matchedCode) {
      throw new AppError("Wrong Code!");
    }

    await this.userRepo.updateOne(
      { _id: user._id },
      {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpire: null,
      },
    );
  }
}

module.exports = verifyEmailUseCase;
