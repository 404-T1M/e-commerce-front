const catchAsync = require("../../../shared/utils/catchAsync");
const AddAddressUseCase = require("../useCases/addCustomerAddress");
const GetAllCustomerAddressesUseCase = require("../useCases/listAllCustomerAddressUseCase");
const ListAllAddressesUseCase = require("../useCases/listAllAddressesUseCase");
const UpdateAddressUseCase = require("../useCases/updateAddressUseCase");
const DeleteAddressUseCase = require("../useCases/deleteAddressUseCase");

class AddressController {
  constructor() {
    this.addAddressUseCase = new AddAddressUseCase();
    this.listAllCustomerAddressesUseCase = new GetAllCustomerAddressesUseCase();
    this.listAllAddressesUseCase = new ListAllAddressesUseCase();
    this.updateAddressUseCase = new UpdateAddressUseCase();
    this.deleteAddressUseCase = new DeleteAddressUseCase();
  }

  createAddress = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;

    const address = await this.addAddressUseCase.execute(loggedInUser, body);

    res.status(201).json({
      message: "Address Added Successfully",
      address,
    });
  });

  updateAddress = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { addressId } = req.params;
    const body = req.body;

    const address = await this.updateAddressUseCase.execute(
      loggedInUser,
      addressId,
      body,
    );

    res.status(201).json({
      message: "Address Updated Successfully",
      address,
    });
  });

  ListAllAddresses = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      isPrimary: req.query.isPrimary,
      country: req.query.country,
      user: req.query.user,
      postalCode: req.query.postalCode,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 15,
      sort: req.query.sort,
    };

    const addresses = await this.listAllAddressesUseCase.execute(
      loggedInUser,
      filter,
    );
    res.status(200).json({
      addresses: addresses.data,
      meta: addresses.meta,
    });
  });

  listCustomerAddresses = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const customerId = req.params?.customerId;

    const address = await this.listAllCustomerAddressesUseCase.execute(
      loggedInUser,
      customerId,
    );
    res.status(200).json({
      address,
    });
  });

  deleteAddress = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { addressId } = req.params;

    await this.deleteAddressUseCase.execute(loggedInUser, addressId);

    res.status(200).json({
      message: "Address Deleted Successfully",
    });
  });
}

module.exports = AddressController;
