const catchAsync = require("../../../shared/utils/catchAsync");
const CreateCategoryUseCase = require("../useCases/createCategoryUseCase");
const ListAllCategoriesUseCase = require("../useCases/listAllCategoriesUseCase");
const UpdateCategoryUseCase = require("../useCases/updateCategoryUseCase");
const DeleteCategoryUseCase = require("../useCases/deleteCategoryUseCase");
const GetCategoryUseCase = require("../useCases/getCategoryUseCase");
const UnpublishCategoryUseCase = require("../useCases/unpublishCategoryUseCase");
const PublishCategoryUseCase = require("../useCases/publishCategoryUseCase");
const RestoreDeletedCategoryUseCase = require("../useCases/restoreDeletedCategory");

class CategoryController {
  constructor() {
    this.createCategoryUseCase = new CreateCategoryUseCase();
    this.listAllCategoriesUseCase = new ListAllCategoriesUseCase();
    this.deleteCategoryUseCase = new DeleteCategoryUseCase();
    this.updateCategoryUseCase = new UpdateCategoryUseCase();
    this.getCategoryUseCase = new GetCategoryUseCase();
    this.unpublishCategoryUseCase = new UnpublishCategoryUseCase();
    this.publishCategoryUseCase = new PublishCategoryUseCase();
    this.restoreDeletedCategoryUseCase = new RestoreDeletedCategoryUseCase();
  }

  createCategory = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;
    const imageFile = req.file;

    const category = await this.createCategoryUseCase.execute(
      loggedInUser,
      body,
      imageFile,
    );
    res.status(201).json({
      message: "Category Created Successfully",
      category,
    });
  });

  adminListAllCategories = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      name: req.query.name,
      published: req.query.published,
      isDeleted: req.query.isDeleted,
      parent: req.query.parent,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };
    const result = await this.listAllCategoriesUseCase.execute(
      loggedInUser,
      filter,
    );
    res.status(200).json({
      categories: result.categories,
      meta: result.meta,
    });
  });

  usersListAllCategories = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      name: req.query.name,
      published: true,
      isDeleted: false,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };
    const result = await this.listAllCategoriesUseCase.execute(
      loggedInUser,
      filter,
    );
    res.status(200).json({
      categories: result.categories,
      meta: result.meta,
    });
  });

  getCategory = catchAsync(async (req, res, next) => {
    const { categoryId } = req.params;
    const category = await this.getCategoryUseCase.execute(categoryId);
    res.status(200).json({
      message: "Success",
      category,
    });
  });

  deleteCategory = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { categoryId } = req.params;
    await this.deleteCategoryUseCase.execute(loggedInUser, categoryId);
    res.status(203).json({
      message: "Category Deleted Successfully",
    });
  });

  updateCategory = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { categoryId } = req.params;
    const body = req.body;
    const imageFile = req.file;

    const category = await this.updateCategoryUseCase.execute(
      loggedInUser,
      categoryId,
      body,
      imageFile,
    );
    res.status(201).json({
      message: "Category Updated Successfully",
      category,
    });
  });

  unPublishCategory = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { categoryId } = req.params;

    await this.unpublishCategoryUseCase.execute(loggedInUser, categoryId);
    res.status(201).json({
      message: `Category Unpublished Successfully`,
    });
  });

  publishCategory = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { categoryId } = req.params;

    await this.publishCategoryUseCase.execute(loggedInUser, categoryId);
    res.status(201).json({
      message: `Category Published Successfully`,
    });
  });

  restoreDeletedCategory = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { categoryId } = req.params;

    await this.restoreDeletedCategoryUseCase.execute(loggedInUser, categoryId);
    res.status(201).json({
      message: `Category Restored Successfully`,
    });
  });
}

module.exports = CategoryController;
