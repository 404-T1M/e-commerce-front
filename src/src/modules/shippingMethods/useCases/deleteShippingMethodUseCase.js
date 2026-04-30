const AppError = require("../../../core/errors/appError");
const ShippingMethodRepository = require("../repositories/shippingMethodRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class DeleteShippingMethodUseCase {
  constructor() {
    this.shippingMethodRepo = new ShippingMethodRepository();
  }

  async execute(loggedInUser, shippingMethodId) {
    await assertAdminPermission(loggedInUser, "shippingMethods.delete");

    const shippingMethod = await this.shippingMethodRepo.findOne({
      _id: shippingMethodId,
    });
    if (!shippingMethod) {
      throw new AppError("Shipping Method Not Found", 404);
    }

    await this.shippingMethodRepo.deleteOne({ _id: shippingMethod._id });
  }
}

module.exports = DeleteShippingMethodUseCase;
