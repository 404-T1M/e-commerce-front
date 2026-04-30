const AddressRepository = require("../repositories/addressRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class DeleteAddressUseCase {
  constructor() {
    this.addressRepo = new AddressRepository();
  }

  async execute(loggedInUser, addressId) {
    let filter = {
      _id: addressId,
    };

    if (loggedInUser.role === "admin") {
      await assertAdminPermission(loggedInUser, "customers.list");
    } else {
      filter.user = loggedInUser.id;
    }

    await this.addressRepo.deleteOne(filter);
  }
}

module.exports = DeleteAddressUseCase;
