const ProductRepository = require("../../repositories/productRepository");
const ProductVariantRepository = require("../../repositories/productVariantRepository");
const CategoryRepository = require("../../../categories/repositories/categoryRepository");
const AppError = require("../../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");

class PublishProductUseCase {
  constructor() {
    this.productRepo = new ProductRepository();
    this.productVariantRepo = new ProductVariantRepository();
    this.categoryRepo = new CategoryRepository();
  }

  async execute(loggedInUser, productId) {
    await assertAdminPermission(loggedInUser, "products.delete");

    const product = await this.productRepo.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product) {
      throw new AppError("Product Not Found", 404);
    }

    const category = await this.categoryRepo.findOne({
      _id: product.category,
    });
    if (!category?.published) {
      throw new AppError("Cannot publish product in unpublished category", 409);
    }

    await this.productRepo.updateOne({ _id: productId }, { published: true });
  }
}

module.exports = PublishProductUseCase;
