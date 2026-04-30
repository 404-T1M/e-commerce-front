const AppError = require("../../../core/errors/appError");
const EmailService = require("../../../shared/services/emailService");
const {
  sendVerificationCodeTemplate,
} = require("../../../shared/services/templates/sendVerificationCodeTemplate");
const { hashingCodes } = require("../../../shared/utils/codeHasher");
const { codeGeneration } = require("../../../shared/utils/codeGeneration");

class ChangeEmailUseCase {
  constructor() {
    this.emailSender = new EmailService();
  }
  async execute(customer, newEmail) {
    
    customer.email = newEmail;
    customer.emailVerified = false;
    const code = codeGeneration();
    const hashedCode = await hashingCodes(code);
    customer.verificationCode = hashedCode;
    customer.verificationCodeExpire = Date.now() + 10 * 60 * 1000;

    await this.emailSender.sendEmail(
      newEmail,
      "Email Verification Code",
      sendVerificationCodeTemplate(code),
    );
    return customer;
  }
}

module.exports = ChangeEmailUseCase;
