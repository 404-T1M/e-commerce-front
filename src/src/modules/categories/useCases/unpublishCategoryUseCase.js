const CategoryRepository = require("../repositories/categoryRepository");
const ProductRepository = require("../../products/repositories/productRepository");
const ProductVariantRepository = require("../../products/repositories/productVariantRepository");
const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class UnpublishCategoryUseCase {
  constructor() {
    this.categoryRepo = new CategoryRepository();
    this.productRepo = new ProductRepository();
    this.productVariantRepo = new ProductVariantRepository();
  }
  async execute(loggedInUser, categoryId) {
    await assertAdminPermission(loggedInUser, "categories.update");

    const category = await this.categoryRepo.findOne({
      _id: categoryId,
      isDeleted: false,
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const subCategories = await this.categoryRepo.find(
      { parent: categoryId, isDeleted: false },
      { _id: 1 },
    );

    const categoryIds = [categoryId, ...subCategories.map((c) => c._id)];

    await this.categoryRepo.updateMany(
      { _id: { $in: categoryIds } },
      { published: false },
    );

    const products = await this.productRepo.find(
      { category: { $in: categoryIds }, isDeleted: false },
      { _id: 1 },
    );

    const productIds = products.map((p) => p._id);

    await this.productRepo.updateMany(
      { _id: { $in: productIds } },
      { published: false },
    );

    if (productIds.length > 0) {
      await this.productVariantRepo.updateMany(
        { product: { $in: productIds }, isDeleted: false },
        { published: false },
      );
    }
  }
}
module.exports = UnpublishCategoryUseCase;
