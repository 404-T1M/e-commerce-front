const AttributeRepository = require("../repositories/attributeRepository");
const AttributeResponseDTO = require("../DTO/attributeResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class GetAllAttributes {
  constructor() {
    this.attributeRepo = new AttributeRepository();
  }

  async execute(loggedInUser, filter = {}) {
    await assertAdminPermission(loggedInUser, "attributes.list");

    const pagination = {
      page: Number(filter.page) || 1,
      limit: Number(filter.limit) || 15,
    };

    const query = {
      ...filter,
      ...pagination,
    };

    const [attributes, total] = await Promise.all([
      this.attributeRepo.find(query),
      this.attributeRepo.count(query),
    ]);

    return {
      data: attributes.map((attribute) => new AttributeResponseDTO(attribute)),
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }
}

module.exports = GetAllAttributes;
