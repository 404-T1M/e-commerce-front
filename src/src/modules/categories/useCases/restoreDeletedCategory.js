const CategoryRepository = require("../repositories/categoryRepository");
const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class RestoreDeletedCategoryUseCase {
  constructor() {
    this.categoryRepo = new CategoryRepository();
  }
  async execute(loggedInUser, categoryId) {
    await assertAdminPermission(loggedInUser, "categories.update");

    const category = await this.categoryRepo.findOne({
      _id: categoryId,
      isDeleted: true,
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    await this.categoryRepo.updateOne(
      { _id: category._id },
      { isDeleted: false, published: false },
    );
  }
}
module.exports = RestoreDeletedCategoryUseCase;
