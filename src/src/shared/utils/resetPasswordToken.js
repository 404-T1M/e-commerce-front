const crypto = require("crypto");

class ResetPasswordToken {
  createToken = () => {
    return crypto.randomBytes(32).toString("hex");
  };

  hashToken = (realToken) => {
    return crypto.createHash("sha256").update(realToken).digest("hex");
  };
}

module.exports = ResetPasswordToken;
