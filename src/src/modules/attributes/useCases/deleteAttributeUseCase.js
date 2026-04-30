const AppError = require("../../../core/errors/appError");
const AttributeRepository = require("../repositories/attributeRepository");
const CategoryRepository = require("../../categories/repositories/categoryRepository");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class DeleteAttributeUseCase {
  constructor() {
    this.attributeRepo = new AttributeRepository();
    this.categoryRepo = new CategoryRepository();
  }

  async execute(loggedInUser, attributeId) {
    await assertAdminPermission(loggedInUser, "attributes.delete");

    const attribute = await this.attributeRepo.findOne({
      _id: attributeId,
      isDeleted: false,
    });
    if (!attribute) {
      throw new AppError("Attribute Not Founded", 404);
    }

    const categoriesHaveTheAttribute = await this.categoryRepo.find({
      "attributes.attribute": attribute._id,
    });

    if (categoriesHaveTheAttribute.length > 0) {
      await this.categoryRepo.updateMany(
        {
          "attributes.attribute": attribute._id,
        },
        { $pull: { attributes: { attribute: attribute._id } } },
      );
    }

    await this.attributeRepo.updateOne(
      { _id: attribute._id },
      { isDeleted: true },
    );
  }
}

module.exports = DeleteAttributeUseCase;
