const AppError = require("../../../core/errors/appError");

class adminGroup {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.permissions = data.permissions;
    this.createdAt = data.createdAt;
  }

  static createAdminGroup(data) {
    return new User({
      name: data.name,
      permissions: data.permissions,
    });
  }
}

module.exports = adminGroup;
