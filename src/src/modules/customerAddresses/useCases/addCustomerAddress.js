const AppError = require("../../../core/errors/appError");
const AddressRepository = require("../repositories/addressRepository");
const UserRepository = require("../../users/repositories/userRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class AddAddressUseCase {
  constructor() {
    this.addressRepo = new AddressRepository();
    this.userRepo = new UserRepository();
  }

  async execute(loggedInUser, body) {
    let {
      customer,
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
    if (loggedInUser.role === "admin") {
      await assertAdminPermission(loggedInUser, "customers.create");
    } else {
      customer = loggedInUser.id;
    }

    if (!address || !country || !recipientMobilePhone || !recipientName) {
      throw new AppError(
        "Address,Country,MobilePhone and RecipientName are Required",
        400,
      );
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

    if (isPrimary) {
      await this.addressRepo.updateMany(
        { user: existUser._id, isPrimary: true },
        { isPrimary: false },
      );
    }

    const userAddresses = await this.addressRepo.count({
      user: existUser._id,
    });

    if (userAddresses === 0) {
      isPrimary = true;
    }

    const newAddress = await this.addressRepo.create({
      user: existUser._id,
      address,
      isPrimary,
      governorate,
      recipientMobilePhone,
      recipientName,
      country,
      postalCode,
      city,
      notes,
    });
    return newAddress;
  }
}

module.exports = AddAddressUseCase;
