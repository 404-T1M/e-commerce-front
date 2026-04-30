const catchAsync = require("../../../shared/utils/catchAsync");
const CreateShippingMethodUseCase = require("../useCases/createShippingMethodUseCase");
const ListAdminShippingMethodsUseCase = require("../useCases/listAdminShippingMethodsUseCase");
const UpdateShippingMethodUseCase = require("../useCases/updateShippingMethodUseCase");
const DeleteShippingMethodUseCase = require("../useCases/deleteShippingMethodUseCase");
const ListPublicShippingMethodsUseCase = require("../useCases/listPublicShippingMethodsUseCase");

class ShippingMethodController {
  constructor() {
    this.createShippingMethodUseCase = new CreateShippingMethodUseCase();
    this.listAdminShippingMethodsUseCase = new ListAdminShippingMethodsUseCase();
    this.updateShippingMethodUseCase = new UpdateShippingMethodUseCase();
    this.deleteShippingMethodUseCase = new DeleteShippingMethodUseCase();
    this.listPublicShippingMethodsUseCase =
      new ListPublicShippingMethodsUseCase();
  }

  createShippingMethod = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;
    const imageFile = req.file;

    const shippingMethod = await this.createShippingMethodUseCase.execute(
      loggedInUser,
      body,
      imageFile,
    );

    res.status(201).json({
      message: "Shipping Method Created Successfully",
      shippingMethod,
    });
  });

  listAdminShippingMethods = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      name: req.query.name,
      isActive: req.query.isActive,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 15,
      sort: req.query.sort,
    };

    const result = await this.listAdminShippingMethodsUseCase.execute(
      loggedInUser,
      filter,
    );

    res.status(200).json(result);
  });

  updateShippingMethod = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { shippingMethodId } = req.params;
    const body = req.body;
    const imageFile = req.file;

    const shippingMethod = await this.updateShippingMethodUseCase.execute(
      loggedInUser,
      shippingMethodId,
      body,
      imageFile,
    );

    res.status(200).json({
      message: "Shipping Method Updated Successfully",
      shippingMethod,
    });
  });

  deleteShippingMethod = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { shippingMethodId } = req.params;

    await this.deleteShippingMethodUseCase.execute(
      loggedInUser,
      shippingMethodId,
    );

    res.status(200).json({
      message: "Shipping Method Deleted Successfully",
    });
  });

  listPublicShippingMethods = catchAsync(async (req, res, next) => {
    const shippingMethods =
      await this.listPublicShippingMethodsUseCase.execute();

    res.status(200).json({ shippingMethods });
  });
}

module.exports = ShippingMethodController;
