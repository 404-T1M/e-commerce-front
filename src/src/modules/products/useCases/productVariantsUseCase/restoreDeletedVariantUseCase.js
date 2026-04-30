const ProductRepository = require("../../repositories/productRepository");
const ProductVariantRepository = require("../../repositories/productVariantRepository");
const AppError = require("../../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");

class RestoreDeletedProductUseCase {
  constructor() {
    this.productRepo = new ProductRepository();
    this.productVariantRepo = new ProductVariantRepository();
  }

  async execute(loggedInUser, variantId) {
    await assertAdminPermission(loggedInUser, "products.delete");

    const productVariant = await this.productVariantRepo.findOne({
      _id: variantId,
      isDeleted: true,
    });
    if (!productVariant) {
      throw new AppError("Variant Not Found", 404);
    }

    const product = await this.productRepo.findOne({
      _id: productVariant.product,
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }
    if (product.isDeleted) {
      throw new AppError("The Main Product Has Deleted", 404);
    }

    await this.productVariantRepo.updateOne(
      {
        _id: productVariant._id,
      },
      { isDeleted: false, published: false },
    );
  }
}

module.exports = RestoreDeletedProductUseCase;
