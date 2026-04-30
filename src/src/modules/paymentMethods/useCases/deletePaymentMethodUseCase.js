const AppError = require("../../../core/errors/appError");
const PaymentMethodRepository = require("../repositories/paymentMethodRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class DeletePaymentMethodUseCase {
  constructor() {
    this.paymentMethodRepo = new PaymentMethodRepository();
  }

  async execute(loggedInUser, paymentMethodId) {
    await assertAdminPermission(loggedInUser, "paymentMethods.delete");

    const paymentMethod = await this.paymentMethodRepo.findOne({
      _id: paymentMethodId,
    });
    if (!paymentMethod) {
      throw new AppError("Payment Method Not Found", 404);
    }

    await this.paymentMethodRepo.deleteOne({ _id: paymentMethod._id });
  }
}

module.exports = DeletePaymentMethodUseCase;
