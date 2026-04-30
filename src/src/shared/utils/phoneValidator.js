const { parsePhoneNumberFromString } = require("libphonenumber-js");
const AppError = require("../../core/errors/appError");

exports.phoneFormate = (mobilePhone) => {
  const phoneNumber = parsePhoneNumberFromString(mobilePhone);
  if (!phoneNumber || !phoneNumber.isValid()) {
    throw new AppError("Invalid phone number format", 400);
  }
  return phoneNumber.format("E.164");
};
