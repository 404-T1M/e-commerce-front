const bcrypt = require("bcryptjs");
const AppError = require("../../core/errors/appError");

exports.hashingCodes = async (code) => {
  if (!code) {
    throw new AppError("Code is Required", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(String(code), salt);
  return hashed;
};

exports.compareCode = async (enteredCode, hashedCode) => {
  return await bcrypt.compare(enteredCode, hashedCode);
};

exports.codeExpired = (expireDate) => {
  if (new Date() > expireDate) {
    throw new AppError("Code Expired", 400);
  }
};
