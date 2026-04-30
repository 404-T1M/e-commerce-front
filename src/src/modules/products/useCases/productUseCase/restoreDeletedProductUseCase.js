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

  async execute(loggedInUser, productId) {
    await assertAdminPermission(loggedInUser, "products.delete");

    const product = await this.productRepo.findOne({
      _id: productId,
      isDeleted: true,
    });
    if (!product) {
      throw new AppError("Product Not Found", 404);
    }

    await this.productRepo.updateOne(
      {
        _id: product._id,
      },
      { isDeleted: false, published: false },
    );

    await this.productVariantRepo.updateMany(
      { product: product._id },
      { isDeleted: false, published: false },
    );
  }
}

module.exports = RestoreDeletedProductUseCase;
