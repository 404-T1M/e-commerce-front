const userRepository = require("../repositories/userRepository");
const AppError = require("../../../core/errors/appError");
const { hashingPassword } = require("../../../shared/utils/passwordHasher");
const resendVerificationCodeUseCase = require("./resendVerificationCodeUseCase");
const { phoneFormate } = require("../../../shared/utils/phoneValidator");
const ChangeEmailUseCase = require("./updateEmailUseCase");
const UpdateProfileImageUseCase = require("./updateProfileImageUseCase");
const UpdatePasswordUseCase = require("./updatePasswordUseCase");
const LoginResponseDTO = require("../DTO/LoginResponseDTO");

class ChangeInfoUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.changeEmailUseCase = new ChangeEmailUseCase();
    this.updateProfileImageUseCase = new UpdateProfileImageUseCase();
    this.updatePasswordUseCase = new UpdatePasswordUseCase();
  }
  async execute(loggedInUser, data, image) {
    if(!data.name && !data.mobilePhone && !data.email && !data.newPassword && !image){
      throw new AppError("At least one field must be provided to update", 400);
    }

    let customer = await this.userRepo.findOne(
      { _id: loggedInUser._id },
      { withPassword: true, withVerificationCode: true },
    );
    if (!customer) {
      throw new AppError("User Not Found", 404);
    }

    if (data.name) {
      if (customer.name === data.name) {
        throw new AppError(
          "You are already using this name, please choose a different one",
          400,
        );
      }
      customer.name = data.name;
    }

    if (data.mobilePhone) {
      if (customer.mobilePhone === phoneFormate(data.mobilePhone)) {
        throw new AppError(
          "New phone number cannot be the same as the current phone number",
          400,
        );
      }
      const user = await this.userRepo.findByPhone(
        phoneFormate(data.mobilePhone),
      );
      if (user) {
        throw new AppError("Phone Already Exists", 400);
      }
      customer.mobilePhone = phoneFormate(data.mobilePhone);
    }

    if (data.email) {
      if (customer.email === data.email) {
        throw new AppError(
          "New email cannot be the same as the current email",
          400,
        );
      }
      const user = await this.userRepo.findByEmail(data.email);
      if (user) {
        throw new AppError("Email Already Exists", 400);
      }
      const changed = await this.changeEmailUseCase.execute(
        customer,
        data.email,
      );
      customer.email = changed.email;
      customer.emailVerified = changed.emailVerified;
      customer.verificationCode = changed.verificationCode;
      customer.verificationCodeExpire = changed.verificationCodeExpire;
    }

    if (data.newPassword) {
      const changedPassword = await this.updatePasswordUseCase.execute(
        customer,
        data,
      );
      customer.password = changedPassword.password;
      customer.tokenVersion = changedPassword.tokenVersion;
    }

    if (image) {
      const changedProfileImage = await this.updateProfileImageUseCase.execute(
        customer,
        image,
      );
      customer.profileImage = changedProfileImage.profileImage;
    }
    await this.userRepo.save(customer);

    return new LoginResponseDTO(customer, null);
  }
}

module.exports = ChangeInfoUseCase;
