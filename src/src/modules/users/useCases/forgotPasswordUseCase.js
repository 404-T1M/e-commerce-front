const userRepository = require("../repositories/userRepository");
const User = require("../entities/userEntity");
const AppError = require("../../../core/errors/appError");
const ResetPasswordToken = require("../../../shared/utils/resetPasswordToken");
const EmailService = require("../../../shared/services/emailService");
const {
  resetPasswordTemplate,
} = require("../../../shared/services/templates/resetPasswordTemplate");

class ForgotPasswordUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.emailSender = new EmailService();
    this.tokenService = new ResetPasswordToken();
  }
  async execute({ email }) {
    const user = await this.userRepo.findByEmail(email);
    if (!user || user.isDeleted) {
      throw new AppError("User Not Found", 404);
    }

    const userEntity = new User(user);
    userEntity.deletedUser();
    userEntity.activeUser();
    userEntity.verifiedEmail();

    const resetToken = this.tokenService.createToken();
    const hashedToken = this.tokenService.hashToken(resetToken);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await this.userRepo.updateOne(
      { _id: user._id },
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: Date.now() + 1000 * 60 * 10,
      },
    );

    await this.emailSender.sendEmail(
      user.email,
      "Reset Your Password",
      resetPasswordTemplate(user.name, resetUrl),
    );
  }
}

module.exports = ForgotPasswordUseCase;
