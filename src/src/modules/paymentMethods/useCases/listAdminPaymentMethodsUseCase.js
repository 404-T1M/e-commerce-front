const PaymentMethodRepository = require("../repositories/paymentMethodRepository");
const PaymentMethodResponseDTO = require("../DTO/paymentMethodResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class ListAdminPaymentMethodsUseCase {
  constructor() {
    this.paymentMethodRepo = new PaymentMethodRepository();
  }

  async execute(loggedInUser, filter) {
    await assertAdminPermission(loggedInUser, "paymentMethods.list");

    const query = {};

    if (filter.name) {
      query.$or = [
        { "name.en": { $regex: filter.name, $options: "i" } },
        { "name.ar": { $regex: filter.name, $options: "i" } },
      ];
    }

    if (filter.isActive != null) {
      query.isActive = filter.isActive === "true" || filter.isActive === true;
    }

    const page = filter.page || 1;
    const limit = filter.limit || 15;
    const sort = filter.sort || "-createdAt";

    const [paymentMethods, total] = await Promise.all([
      this.paymentMethodRepo.find(query, sort, page, limit, {
        populateCreatedBy: true,
      }),
      this.paymentMethodRepo.countDocuments(query),
    ]);

    return {
      total,
      page,
      limit,
      paymentMethods: paymentMethods.map((pm) => new PaymentMethodResponseDTO(pm)),
    };
  }
}

module.exports = ListAdminPaymentMethodsUseCase;
