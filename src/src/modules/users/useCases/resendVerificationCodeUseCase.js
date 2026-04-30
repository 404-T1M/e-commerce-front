const userRepository = require("../repositories/userRepository");
const User = require("../entities/userEntity");
const AppError = require("../../../core/errors/appError");
const { hashingCodes } = require("../../../shared/utils/codeHasher");
const { codeGeneration } = require("../../../shared/utils/codeGeneration");
const EmailService = require("../../../shared/services/emailService");
const {
  sendVerificationCodeTemplate,
} = require("../../../shared/services/templates/sendVerificationCodeTemplate");

class resendVerificationCodeUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.emailSender = new EmailService();
  }

  async execute({ email }) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError("User Not Found", 404);
    }

    const userEntity = new User(user);
    userEntity.deletedUser();
    userEntity.activeUser();

    if (user.emailVerified) {
      throw new AppError("Already Verified", 400);
    }

    const code = codeGeneration();
    const hashedCode = await hashingCodes(code);

    await this.userRepo.updateOne(
      { _id: user._id },
      {
        verificationCode: hashedCode,
        verificationCodeExpire: Date.now() + 1000 * 60 * 10,
      },
    );

    await this.emailSender.sendEmail(
      user.email,
      "Email Verification Code",
      sendVerificationCodeTemplate(code),
    );
  }
}

module.exports = resendVerificationCodeUseCase;
