const CategoryRepository = require("../repositories/categoryRepository");
const ProductRepository = require("../../products/repositories/productRepository");
const ProductVariantRepository = require("../../products/repositories/productVariantRepository");
const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class PublishCategoryUseCase {
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
    
    if (category.published) return;

    await this.categoryRepo.updateOne(
      { _id: category._id },
      { published: true },
    );
  }
}
module.exports = PublishCategoryUseCase;
