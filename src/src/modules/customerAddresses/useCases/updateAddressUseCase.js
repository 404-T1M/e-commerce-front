const AppError = require("../../../core/errors/appError");
const AddressRepository = require("../repositories/addressRepository");
const UserRepository = require("../../users/repositories/userRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class UpdateAddressUseCase {
  constructor() {
    this.addressRepo = new AddressRepository();
    this.userRepo = new UserRepository();
  }

  async execute(loggedInUser, addressId, body) {
    let {
      country,
      governorate,
      recipientMobilePhone,
      address,
      recipientName,
      isPrimary,
      postalCode,
      city,
      notes,
    } = body;

    const addressDoc = await this.addressRepo.findOne({
      _id: addressId,
    });

    if (!addressDoc) {
      throw new AppError("Address Not Found", 404);
    }

    if (loggedInUser.role === "admin") {
      await assertAdminPermission(loggedInUser, "customers.update");
    } else {
      if (addressDoc.user.toString() !== loggedInUser.id) {
        throw new AppError("You are not allowed to update this address", 403);
      }
    }

    if (isPrimary) {
      await this.addressRepo.updateMany(
        { user: addressDoc.user, isPrimary: true },
        { isPrimary: false },
      );
    }

    const updatedAddress = await this.addressRepo.updateOne(
      { _id: addressId },
      {
        country,
        governorate,
        recipientMobilePhone,
        address,
        recipientName,
        isPrimary,
        postalCode,
        city,
        notes,
      },
    );

    return updatedAddress;
  }
}

module.exports = UpdateAddressUseCase;
