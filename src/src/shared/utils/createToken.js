const jwt = require("jsonwebtoken");

exports.createToken = (id, role, tokenVersion) => {
  const payload = { id, role, tokenVersion };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
