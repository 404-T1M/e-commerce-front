const PaymentMethodRepository = require("../repositories/paymentMethodRepository");
const PaymentMethodResponseDTO = require("../DTO/paymentMethodResponseDTO");

class ListPublicPaymentMethodsUseCase {
  constructor() {
    this.paymentMethodRepo = new PaymentMethodRepository();
  }

  async execute() {
    const paymentMethods = await this.paymentMethodRepo.find(
      { isActive: true },
      "name",
      1,
      100,
    );

    return paymentMethods.map((pm) => new PaymentMethodResponseDTO(pm));
  }
}

module.exports = ListPublicPaymentMethodsUseCase;
