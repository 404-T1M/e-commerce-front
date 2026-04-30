const userRepository = require("../repositories/userRepository");
const adminGroupRepository = require("../../administratorsGroup/repositories/administratorsGroupRepository");
const AppError = require("../../../core/errors/appError");
const User = require("../entities/userEntity");
const ListUserResponseDTO = require("../DTO/ListUserResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class changeUserStatusUseCase {
  constructor() {
    this.userRepo = new userRepository();
    this.adminGroupRepo = new adminGroupRepository();
  }
  async execute(loggedInUser, customerId) {
    await assertAdminPermission(loggedInUser, "customers.update");

    let customer = await this.userRepo.findOne({
      _id: customerId,
    });
    if (!customer) {
      throw new AppError("User Not Found", 404);
    }
    const userEntity = new User(customer);
    userEntity.deletedUser();

    customer = await this.userRepo.updateOne(
      { _id: customer.id },
      {
        status: customer.status ? false : true,
      },
    );

    return new ListUserResponseDTO(customer);
  }
}
module.exports = changeUserStatusUseCase;
