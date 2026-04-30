const userRepository = require("../repositories/userRepository");
const adminGroupRepository = require("../../administratorsGroup/repositories/administratorsGroupRepository");
const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const ListUserResponseDTO = require("../DTO/ListUserResponseDTO");
const User = require("../entities/userEntity");
const { hashingPassword } = require("../../../shared/utils/passwordHasher");
const { phoneFormate } = require("../../../shared/utils/phoneValidator");

class addAdminUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.adminGroupRepo = new adminGroupRepository();
  }
  async execute(loggedInUser, body) {
    await assertAdminPermission(loggedInUser, "users.create");

    const [existingEmail, existingPhone] = await Promise.all([
      this.userRepo.findByEmail(body.email),
      this.userRepo.findByPhone(phoneFormate(body.mobilePhone)),
    ]);

    if (existingEmail) {
      throw new AppError("Email already in use", 409);
    }

    if (existingPhone) {
      throw new AppError("Phone number already registered", 409);
    }

    const adminGroup = await this.adminGroupRepo.findOne({
      _id: body.adminGroup,
    });
    if (!adminGroup) {
      throw new AppError("Admin Group Not Founded", 404);
    }

    body.password = await hashingPassword(body.password);
    body.mobilePhone = phoneFormate(body.mobilePhone);

    const admin = User.createForAddAdmin(body);
    const savedAdmin = await this.userRepo.save(admin);
    return new ListUserResponseDTO(savedAdmin);
  }
}

module.exports = addAdminUseCase;
