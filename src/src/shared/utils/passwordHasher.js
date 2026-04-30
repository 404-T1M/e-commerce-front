const bcrypt = require("bcryptjs");
const AppError = require("../../core/errors/appError");

exports.hashingPassword = async (password) => {
  
  if (password.length < 8 || !password) {
    throw new AppError("Password length Shouldn't Be Less than 8", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
};

exports.comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};
