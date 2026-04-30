const ProductVariantRepository = require("../../repositories/productVariantRepository");
const AppError = require("../../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");

class DeleteProductVariantUseCase {
  constructor() {
    this.variantRepo = new ProductVariantRepository();
  }

  async execute(loggedInUser, variantId) {
    await assertAdminPermission(loggedInUser, "products.delete");

    const variant = await this.variantRepo.findOne({
      _id: variantId,
      isDeleted: false,
    });
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    await this.variantRepo.updateOne(
      { _id: variantId },
      {
        isDeleted: true,
        published: false,
      },
    );
  }
}

module.exports = DeleteProductVariantUseCase;
