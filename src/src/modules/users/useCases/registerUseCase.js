const User = require("../entities/userEntity");
const userRepository = require("../repositories/userRepository");
const RegisterResponseDTO = require("../DTO/RegisterResponseDTO");
const AppError = require("../../../core/errors/appError");
const { hashingPassword } = require("../../../shared/utils/passwordHasher");
const { hashingCodes } = require("../../../shared/utils/codeHasher");
const { codeGeneration } = require("../../../shared/utils/codeGeneration");
const EmailService = require("../../../shared/services/emailService");
const {
  sendVerificationCodeTemplate,
} = require("../../../shared/services/templates/sendVerificationCodeTemplate");
const { phoneFormate } = require("../../../shared/utils/phoneValidator");

class RegisterUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.emailSender = new EmailService();
  }

  async execute(data) {
    const [existingEmail, existingPhone] = await Promise.all([
      this.userRepo.findByEmail(data.email),
      this.userRepo.findByPhone(phoneFormate(data.mobilePhone)),
    ]);

    if (existingEmail) {
      throw new AppError("Email already in use", 409);
    }

    if (existingPhone) {
      throw new AppError("Phone number already registered", 409);
    }

    const code = codeGeneration();
    const hashedCode = await hashingCodes(code);
    data.password = await hashingPassword(data.password);
    data.mobilePhone = phoneFormate(data.mobilePhone);

    const user = User.createForRegister({
      ...data,
      verificationCode: hashedCode,
    });
    const savedUser = await this.userRepo.create(user);

    await this.emailSender.sendEmail(
      data.email,
      "Email Verification Code",
      sendVerificationCodeTemplate(code),
    );
    return new RegisterResponseDTO(savedUser);
  }
}

module.exports = RegisterUseCase;
