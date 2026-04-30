const catchAsync = require("../../../shared/utils/catchAsync");
const ListAllProductsUseCase = require("../useCases/productUseCase/listAllProductsUseCase");
const GetProductFilterOptionsUseCase = require("../useCases/productUseCase/getProductFilterOptionsUseCase");
const SearchProductsUseCase = require("../useCases/productUseCase/searchProductsUseCase");
const CreateProductUseCase = require("../useCases/productUseCase/createProductUseCase");
const UpdateProductUseCase = require("../useCases/productUseCase/updateProductUseCase");
const DeleteProductUseCase = require("../useCases/productUseCase/deleteProductUseCase");
const RestoreDeletedProductUseCase = require("../useCases/productUseCase/restoreDeletedProductUseCase");
const GetProductUseCase = require("../useCases/productUseCase/getProductUseCase");
const PublishProductUseCase = require("../useCases/productUseCase/publishProductUseCase");
const UnPublishProductUseCase = require("../useCases/productUseCase/unPublishProductUseCase");

class ProductController {
  constructor() {
    this.listAllProductsUseCase = new ListAllProductsUseCase();
    this.getProductFilterOptions = new GetProductFilterOptionsUseCase();
    this.searchProductsUseCase = new SearchProductsUseCase();
    this.createProductUseCase = new CreateProductUseCase();
    this.updateProductUseCase = new UpdateProductUseCase();
    this.deleteProductUseCase = new DeleteProductUseCase();
    this.getProductUseCase = new GetProductUseCase();
    this.publishProductUseCase = new PublishProductUseCase();
    this.unPublishProductUseCase = new UnPublishProductUseCase();
    this.restoreDeletedProductUseCase = new RestoreDeletedProductUseCase();
  }

  createProduct = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body;
    const imageFiles = req.files;

    const product = await this.createProductUseCase.execute(
      loggedInUser,
      body,
      imageFiles,
    );

    res.status(201).json({
      message: "Product Created Successfully",
      product,
    });
  });

  searchProducts = catchAsync(async (req, res) => {
    const { q } = req.query;

    const results = await this.searchProductsUseCase.execute(q, {
      limit: Number(req.query.limit) || 10,
    });

    res.status(200).json({
      results,
    });
  });

  getFilterOptions = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = req.query;
    const result = await this.getProductFilterOptions.execute(
      loggedInUser,
      filter,
    );
    res.status(200).json(result);
  });

  listAllProducts = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const filter = {
      ...req.query,
    };
    const result = await this.listAllProductsUseCase.execute(
      loggedInUser,
      filter,
    );
    res.status(200).json({
      products: result.products,
      meta: result.meta,
    });
  });

  updateProduct = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const body = req.body ?? null;
    const imageFiles = req.files;
    const { productId } = req.params;

    const product = await this.updateProductUseCase.execute(
      loggedInUser,
      productId,
      body,
      imageFiles,
    );

    res.status(200).json({
      message: "Product Updated Successfully",
      product,
    });
  });

  getProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const loggedInUser = req.user;
    const filter = {
      _id: productId,
    };

    if (!loggedInUser || loggedInUser.role !== "admin") {
      filter.isDeleted = false;
      filter.published = true;
    }

    const product = await this.getProductUseCase.execute(loggedInUser, filter);

    res.status(200).json({
      product,
    });
  });

  publishProduct = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { productId } = req.params;

    await this.publishProductUseCase.execute(loggedInUser, productId);

    res.status(200).json({
      message: "Product Published Successfully",
    });
  });

  unPublishProduct = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { productId } = req.params;

    await this.unPublishProductUseCase.execute(loggedInUser, productId);

    res.status(200).json({
      message: "Product UnPublished Successfully",
    });
  });

  deleteProduct = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { productId } = req.params;

    await this.deleteProductUseCase.execute(loggedInUser, productId);

    res.status(200).json({
      message: "Product Deleted Successfully",
    });
  });

  restoreProduct = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { productId } = req.params;

    await this.restoreDeletedProductUseCase.execute(loggedInUser, productId);

    res.status(200).json({
      message: "Product Restored Successfully",
    });
  });
}

module.exports = ProductController;
