const ProductRepository = require("../../repositories/productRepository");
const CategoryRepository = require("../../../categories/repositories/categoryRepository");
const AttributeRepository = require("../../../attributes/repositories/attributeRepository");
const Product = require("../../entities/productEntity");
const AppError = require("../../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");
const ImageService = require("../../../../shared/services/imageUploadService");
const ProductResponseDTO = require("../../DTO/productResponseDTO");

class CreateProductUseCase {
  constructor() {
    this.productRepo = new ProductRepository();
    this.categoryRepo = new CategoryRepository();
    this.attributeRepo = new AttributeRepository();
  }

  async execute(loggedInUser, body, imageFiles) {
    await assertAdminPermission(loggedInUser, "products.create");

    if (!body.nameEn || !body.nameAr) {
      throw new AppError("Name(Ar,En) Are Required", 400);
    }
    if (!body.descriptionEn || !body.descriptionAr) {
      throw new AppError("description(Ar,En) Are Required", 400);
    }
    if (!imageFiles || imageFiles.length === 0) {
      throw new AppError("At least one product image is required", 400);
    }
    if (!body.category) {
      throw new AppError("Category is required", 400);
    }
    //========================================
    const category = await this.categoryRepo.findOne({ _id: body.category });
    if (!category) {
      throw new AppError("Category Not Founded", 404);
    }
    // ========================================
    let uploadedImages = [];
    try {
      uploadedImages = await ImageService.uploadMany({
        files: imageFiles,
        folder: "products",
      });
      const discountType =
        body.discountType === "none" || !body.discountType
          ? null
          : body.discountType;
      const discountValue =
        discountType === null ? 0 : Number(body.discountValue) || 0;
      const discountFrom =
        discountType === null ? null : body.from ? body.from : null;
      const discountTo =
        discountType === null ? null : body.to ? body.to : null;

      let isActive = false;
      if (discountType && discountValue > 0) {
        if (discountType === "percentage" && discountValue > 100) {
          throw new AppError("Percentage discount cannot exceed 100%", 400);
        }

        const now = Date.now();
        if (discountFrom) {
          if (new Date(discountFrom).getTime() < now) {
            throw new AppError("Start date cannot be in the past", 400);
          }
        }
        if (discountTo) {
          if (new Date(discountTo).getTime() < now) {
            throw new AppError("End date cannot be in the past", 400);
          }
        }
        if (discountFrom && discountTo) {
          if (
            new Date(discountTo).getTime() <= new Date(discountFrom).getTime()
          ) {
            throw new AppError("End date must be after the start date", 400);
          }
        }

        isActive = true;
        if (discountFrom && now < new Date(discountFrom).getTime())
          isActive = false;
        if (discountTo && now > new Date(discountTo).getTime())
          isActive = false;
      }

      const product = Product.createProduct({
        name: {
          en: body.nameEn,
          ar: body.nameAr,
        },
        description: {
          en: body.descriptionEn,
          ar: body.descriptionAr,
        },
        images: uploadedImages.map((i) => ({
          fileName: i.publicId,
          size: i.size,
        })),
        category: body.category,
        discountPrice: {
          discountType,
          discountValue,
          from: discountFrom,
          to: discountTo,
          active: isActive,
        },
        createdBy: loggedInUser.id,
      });

      const savedProduct = await this.productRepo.create(product);
      return new ProductResponseDTO(savedProduct);
    } catch (error) {
      if (uploadedImages.length > 0) {
        await ImageService.deleteMany(
          uploadedImages.map((img) => img.publicId),
        );
      }
      throw error;
    }
  }
}

module.exports = CreateProductUseCase;
