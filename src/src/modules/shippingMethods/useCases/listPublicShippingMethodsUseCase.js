const ShippingMethodRepository = require("../repositories/shippingMethodRepository");
const ShippingMethodResponseDTO = require("../DTO/shippingMethodResponseDTO");

class ListPublicShippingMethodsUseCase {
  constructor() {
    this.shippingMethodRepo = new ShippingMethodRepository();
  }

  async execute() {
    const shippingMethods = await this.shippingMethodRepo.find(
      { isActive: true },
      "price",
      1,
      100,
    );

    return shippingMethods.map((sm) => new ShippingMethodResponseDTO(sm));
  }
}

module.exports = ListPublicShippingMethodsUseCase;
