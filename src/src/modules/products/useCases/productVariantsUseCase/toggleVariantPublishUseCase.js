const ProductVariantRepository = require("../../repositories/productVariantRepository");
const ProductRepository = require("../../repositories/productRepository");
const AppError = require("../../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");

class ToggleProductVariantPublishUseCase {
  constructor() {
    this.variantRepo = new ProductVariantRepository();
    this.productRepo = new ProductRepository();
  }

  async execute(loggedInUser, variantId) {
    await assertAdminPermission(loggedInUser, "products.update");

    const variant = await this.variantRepo.findOne({
      _id: variantId,
      isDeleted: false,
    });
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    const product = await this.productRepo.findOne({
      _id: variant.product,
      isDeleted: false,
    });
    if (!product) {
      throw new AppError("Parent product not found", 404);
    }

    if (!product.published) {
      throw new AppError(
        "Cannot publish variant while product is unpublished",
        400,
      );
    }

    if (!variant.published && variant.stock <= 0) {
      throw new AppError("Cannot publish variant with zero stock", 400);
    }

    const updated = await this.variantRepo.updateOne(
      { _id: variantId },
      { published: !variant.published },
    );

    return {
      published: updated.published,
      message: updated.published
        ? "Variant published successfully"
        : "Variant unpublished successfully",
    };
  }
}

module.exports = ToggleProductVariantPublishUseCase;
