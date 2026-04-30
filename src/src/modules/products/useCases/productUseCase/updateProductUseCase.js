const ProductRepository = require("../../repositories/productRepository");
const ProductVariantRepository = require("../../repositories/productVariantRepository");
const CategoryRepository = require("../../../categories/repositories/categoryRepository");
const AttributeRepository = require("../../../attributes/repositories/attributeRepository");
const ProductVariantEntity = require("../../entities/productVariantsEntity");
const AppError = require("../../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");
const ImageService = require("../../../../shared/services/imageUploadService");
const ProductResponseDTO = require("../../DTO/productResponseDTO");

class UpdateProductUseCase {
  constructor() {
    this.productRepo = new ProductRepository();
    this.productVariantsRepo = new ProductVariantRepository();
    this.categoryRepo = new CategoryRepository();
    this.attributeRepo = new AttributeRepository();
  }

  async execute(loggedInUser, productId, body, imageFiles) {
    await assertAdminPermission(loggedInUser, "products.update");

    const product = await this.productRepo.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (body.category) {
      const category = await this.categoryRepo.findOne({ _id: body.category });
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    const updatePayload = {
      ...(body.nameEn || body.nameAr
        ? {
            name: {
              en: body.nameEn ?? product.name.en,
              ar: body.nameAr ?? product.name.ar,
            },
          }
        : {}),

      ...(body.descriptionEn || body.descriptionAr
        ? {
            description: {
              en: body.descriptionEn ?? product.description.en,
              ar: body.descriptionAr ?? product.description.ar,
            },
          }
        : {}),

      ...(body.category && { category: body.category }),
    };

    const discountType =
      body.discountType === "none" || !body.discountType
        ? null
        : body.discountType;
    const discountValue =
      discountType === null ? 0 : Number(body.discountValue) || 0;
    const discountFrom =
      discountType === null ? null : body.from ? body.from : null;
    const discountTo = discountType === null ? null : body.to ? body.to : null;

    // Evaluate active state if the discount details changed
    let isActive = false;
    if (discountType && discountValue > 0) {
      if (discountType === "percentage" && discountValue > 100) {
        throw new AppError("Percentage discount cannot exceed 100%", 400);
      }

      const now = Date.now();

      // Only check 'past' for new dates, not if they are just keeping the existing one.
      if (discountFrom && discountFrom !== product.discountPrice?.from) {
        if (new Date(discountFrom).getTime() < now) {
          throw new AppError("Start date cannot be moved to the past", 400);
        }
      }

      if (discountTo && discountTo !== product.discountPrice?.to) {
        if (new Date(discountTo).getTime() < now) {
          throw new AppError("End date cannot be moved to the past", 400);
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
      if (discountTo && now > new Date(discountTo).getTime()) isActive = false;
    }

    // Pre-validate fixed discounts against existing variants before committing the update
    if (discountType === "fixed" && discountValue > 0) {
      let page = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const existingVariants = await this.productVariantsRepo.find(
          { product: productId },
          { page, limit },
          { createdAt: -1 },
        );

        for (const v of existingVariants) {
          if (discountValue >= v.price.salePrice) {
            throw new AppError(
              `Fixed discount (${discountValue}) cannot be greater than or equal to the variant's sale price (${v.price.salePrice})`,
              400,
            );
          }
        }

        if (existingVariants.length < limit) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    updatePayload.discountPrice = {
      discountType,
      discountValue,
      from: discountFrom,
      to: discountTo,
      active: isActive,
    };

    let uploadedImages = [];
    try {
      if (imageFiles && imageFiles.length > 0) {
        uploadedImages = await ImageService.uploadMany({
          files: imageFiles,
          folder: "products",
        });

        updatePayload.images = uploadedImages.map((img) => ({
          fileName: img.publicId,
          size: img.size,
        }));
      }

      const updated = await this.productRepo.updateOne(
        { _id: productId },
        updatePayload,
      );
      if (uploadedImages.length > 0) {
        await ImageService.deleteMany(
          product.images.map((img) => img.fileName),
        );
      }

      // If the discount metadata changed, trigger a re-calculation of finalPrices on all its variants
      if (
        discountType !== (product.discountPrice?.discountType ?? null) ||
        discountValue !== (product.discountPrice?.discountValue ?? 0) ||
        discountFrom !== (product.discountPrice?.from ?? null) ||
        discountTo !== (product.discountPrice?.to ?? null)
      ) {
        let page = 1;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const variantsToUpdate = await this.productVariantsRepo.find(
            { product: productId },
            { page, limit },
            { createdAt: -1 },
          );

          for (const variant of variantsToUpdate) {
            const newFinalPrice = ProductVariantEntity.calcFinalPrice(
              variant.price.salePrice,
              discountType,
              discountValue,
              discountFrom,
              discountTo,
            );

            if (variant.price.finalPrice !== newFinalPrice) {
              await this.productVariantsRepo.updateOne(
                { _id: variant._id },
                { "price.finalPrice": newFinalPrice },
              );
            }
          }

          if (variantsToUpdate.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      return new ProductResponseDTO(updated);
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

module.exports = UpdateProductUseCase;
