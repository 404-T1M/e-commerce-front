const ShippingMethodRepository = require("../repositories/shippingMethodRepository");
const ShippingMethodResponseDTO = require("../DTO/shippingMethodResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class ListAdminShippingMethodsUseCase {
  constructor() {
    this.shippingMethodRepo = new ShippingMethodRepository();
  }

  async execute(loggedInUser, filter) {
    await assertAdminPermission(loggedInUser, "shippingMethods.list");

    const query = {};

    if (filter.name) {
      query.name = { $regex: filter.name, $options: "i" };
    }

    if (filter.isActive != null) {
      query.isActive = filter.isActive === "true" || filter.isActive === true;
    }

    const page = filter.page || 1;
    const limit = filter.limit || 15;
    const sort = filter.sort || "-createdAt";

    const [shippingMethods, total] = await Promise.all([
      this.shippingMethodRepo.find(query, sort, page, limit, {
        populateCreatedBy: true,
      }),
      this.shippingMethodRepo.countDocuments(query),
    ]);

    return {
      shippingMethods: shippingMethods.map(
        (sm) => new ShippingMethodResponseDTO(sm),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = ListAdminShippingMethodsUseCase;
