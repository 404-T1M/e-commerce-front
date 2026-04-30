const categoryRepository = require("../repositories/categoryRepository");
const CategoryDataResponseDTO = require("../DTO/categoryDataResponseDTO");

const AppError = require("../../../core/errors/appError");

class getCategoryUseCase {
  constructor() {
    this.categoryRepo = new categoryRepository();
  }
  async execute(categoryId) {
    const category = await this.categoryRepo.findOne({
      _id: categoryId,
      published: true,
    });
    if (!category) {
      throw new AppError("Category Not Found", 404);
    }

    const childrenIds = await this.categoryRepo.findChildrenIds(categoryId);
    const allCategoryIds = [categoryId, ...childrenIds];

    const categories = await this.categoryRepo.find({
      _id: { $in: allCategoryIds },
      published: true,
    });

    return categories.map((category) => new CategoryDataResponseDTO(category));
  }
}
module.exports = getCategoryUseCase;
