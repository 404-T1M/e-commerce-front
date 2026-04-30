const AppError = require("../../../core/errors/appError");
const { hashingPassword } = require("../../../shared/utils/passwordHasher");
const { comparePassword } = require("../../../shared/utils/passwordHasher");

class UpdatedPasswordUseCase {
  async execute(customer, data) {
    const { oldPassword, newPassword, confirmNewPassword } = data;
    if (
      !oldPassword ||
      !newPassword ||
      !confirmNewPassword ||
      newPassword.length < 8
    ) {
      throw new AppError(
        "Old Password and New Password and Confirm Password Must Be Provided and at least 8 characters",
        400,
      );
    }
    if (newPassword !== confirmNewPassword) {
      throw new AppError("Password and Confirm Password Must Be Match", 400);
    }

    const matchedPassword = await comparePassword(
      data.oldPassword,
      customer.password,
    );

    if (!matchedPassword) {
      throw new AppError("Wrong Old Password", 400);
    }

    const hashedPassword = await hashingPassword(newPassword);

    const logout = data.loggedOut === "true";

    customer.password = hashedPassword;
    customer.tokenVersion =
      logout === true ? customer.tokenVersion + 1 : customer.tokenVersion;
    return customer;
  }
}

module.exports = UpdatedPasswordUseCase;
