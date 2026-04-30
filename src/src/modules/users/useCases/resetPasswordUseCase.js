const userRepository = require("../repositories/userRepository");
const AppError = require("../../../core/errors/appError");
const ResetPasswordToken = require("../../../shared/utils/resetPasswordToken");
const { hashingPassword } = require("../../../shared/utils/passwordHasher");

class ResetPasswordUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.tokenService = new ResetPasswordToken();
  }
  async execute(data) {
    const hashedToken = this.tokenService.hashToken(data.params.token);
    const user = await this.userRepo.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      status: true,
    });
    if (!user) {
      throw new AppError("Token Invalid Or Expired", 400);
    }

    const { password, confirmPassword } = data.body;
    if (password !== confirmPassword) {
      throw new AppError("Password and Confirm Password Must Be Match", 400);
    }

    const hashedPassword = await hashingPassword(password);
    await this.userRepo.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        tokenVersion: user.tokenVersion + 1,
      },
    );
  }
}

module.exports = ResetPasswordUseCase;
