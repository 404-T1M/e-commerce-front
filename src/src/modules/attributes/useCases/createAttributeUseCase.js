const AppError = require("../../../core/errors/appError");
const Attribute = require("../entities/attributeEntity");
const AttributeRepository = require("../repositories/attributeRepository");
const AttributeResponseDTO = require("../DTO/attributeResponseDTO");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class CreateAttribute {
  constructor() {
    this.attributeRepo = new AttributeRepository();
  }

  async execute(loggedInUser, body) {
    await assertAdminPermission(loggedInUser, "attributes.create");

    if (!body.nameEn || !body.nameAr || !body.type) {
      throw new AppError("Name(Ar,En) and Type Are Required", 400);
    }

    if (body.type === "select") {
      if (!Array.isArray(body.options) || body.options.length === 0) {
        throw new AppError("Options must be a non-empty array", 400);
      }
    }

    const attribute = Attribute.createAttribute({
      ...body,
      createdBy: loggedInUser.id,
    });

    const savedAttribute = await this.attributeRepo.create(attribute);

    return new AttributeResponseDTO(savedAttribute);
  }
}

module.exports = CreateAttribute;
