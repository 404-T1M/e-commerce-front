const AppError = require("../../../core/errors/appError");
const AddressRepository = require("../repositories/addressRepository");
const UserRepository = require("../../users/repositories/userRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const AddressResponseDTO = require("../DTO/addressResponseDTO");

class ListAllCustomerAddressesUseCase {
  constructor() {
    this.addressRepo = new AddressRepository();
    this.userRepo = new UserRepository();
  }

  async execute(loggedInUser, customerId) {
    let customer = customerId;
    if (loggedInUser.role === "admin") {
      await assertAdminPermission(loggedInUser, "customers.list");
    } else {
      customer = loggedInUser.id;
    }

    const existUser = await this.userRepo.findOne({
      _id: customer,
      emailVerified: true,
      status: true,
      isDeleted: false,
    });
    if (!existUser) {
      throw new AppError("User Not Founded", 404);
    }

    const [count, addresses] = await Promise.all([
      this.addressRepo.count({ user: existUser._id }),
      this.addressRepo.find({ user: existUser._id }),
    ]);

    return {
      addresses: addresses.map((address) => new AddressResponseDTO(address)),
      count,
    };
  }
}

module.exports = ListAllCustomerAddressesUseCase;
