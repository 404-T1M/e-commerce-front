const catchAsync = require("../../../shared/utils/catchAsync");
const CreateVariantsUseCase = require("../useCases/productVariantsUseCase/createVariantUseCase");
const UpdateVariantsUseCase = require("../useCases/productVariantsUseCase/updateVariantUseCase");
const ToggleVariantPublishUseCase = require("../useCases/productVariantsUseCase/toggleVariantPublishUseCase");
const DeleteVariantsUseCase = require("../useCases/productVariantsUseCase/deleteVariantUseCase");
const RestoreVariantUseCase = require("../useCases/productVariantsUseCase/restoreDeletedVariantUseCase");
const AppError = require("../../../core/errors/appError");
class ProductController {
  constructor() {
    this.createVariantsUseCase = new CreateVariantsUseCase();
    this.updateVariantsUseCase = new UpdateVariantsUseCase();
    this.toggleVariantPublishUseCase = new ToggleVariantPublishUseCase();
    this.deleteVariantsUseCase = new DeleteVariantsUseCase();
    this.restoreVariantUseCase = new RestoreVariantUseCase();
  }

  createVariants = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { productId } = req.params;
    let { variants } = req.body;
    const variantsImages = req.files;

    if (variants && typeof variants === "string") {
      try {
        variants = JSON.parse(variants);
      } catch (err) {
        throw new AppError("Invalid variants JSON: " + variants, 400);
      }
    }
    const variant = await this.createVariantsUseCase.execute(
      loggedInUser,
      productId,
      variants,
      variantsImages,
    );

    res.status(201).json({
      message: "Variants Added Successfully",
      variant,
    });
  });

  updateVariant = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { variantId } = req.params;
    let { variants } = req.body;
    const variantImage = req.file;

    if (variants && typeof variants === "string") {
      try {
        variants = JSON.parse(variants);
      } catch (err) {
        throw new AppError("Invalid variants JSON: " + variants, 400);
      }
    }

    const variant = await this.updateVariantsUseCase.execute(
      loggedInUser,
      variantId,
      variants,
      variantImage,
    );

    res.status(201).json({
      message: "Variants Updated Successfully",
      variant,
    });
  });

  changePublishStatus = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { variantId } = req.params;

    const variant = await this.toggleVariantPublishUseCase.execute(
      loggedInUser,
      variantId,
    );

    res.status(201).json({
      message: "Variants Updated Successfully",
      variant,
    });
  });

  deleteVariant = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { variantId } = req.params;

    const variant = await this.deleteVariantsUseCase.execute(
      loggedInUser,
      variantId,
    );

    res.status(201).json({
      message: "Variants Deleted Successfully",
      variant,
    });
  });

  restoreVariant = catchAsync(async (req, res, next) => {
    const loggedInUser = req.user;
    const { variantId } = req.params;

    const variant = await this.restoreVariantUseCase.execute(
      loggedInUser,
      variantId,
    );

    res.status(201).json({
      message: "Variants Restored Successfully",
      variant,
    });
  });
}

module.exports = ProductController;
