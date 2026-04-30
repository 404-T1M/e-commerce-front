const ProductRepository = require("../../repositories/productRepository");
const ProductVariantRepository = require("../../repositories/productVariantRepository");
const AttributeRepository = require("../../../attributes/repositories/attributeRepository");
const ProductVariant = require("../../entities/productVariantsEntity");
const AppError = require("../../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");
const ImageService = require("../../../../shared/services/imageUploadService");
const ProductVariantResponseDTO = require("../../DTO/productVariantResponseDTO");

class CreateProductVariantsUseCase {
  constructor() {
    this.productRepo = new ProductRepository();
    this.variantRepo = new ProductVariantRepository();
    this.attributeRepo = new AttributeRepository();
  }

  async execute(loggedInUser, productId, variants, variantImages = []) {
    await assertAdminPermission(loggedInUser, "products.create");

    if (!Array.isArray(variants) || variants.length === 0) {
      throw new AppError("Variants array is required", 400);
    }

    const product = await this.productRepo.findOne(
      { _id: productId, isDeleted: false },
      { populateCategory: true },
    );
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const productName = product?.name?.en ?? product?.name?.ar ?? "";

    if (variantImages.length && variantImages.length !== variants.length) {
      throw new AppError("Images count must match variants count", 400);
    }

    const savedVariants = [];
    const uploadedImages = [];

    try {
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const imageFile = variantImages[i] ?? null;

        const attributes = [];
        for (const attr of variant.attributes ?? []) {
          const attribute = await this.attributeRepo.findOne({
            _id: attr.attributeId,
          });
          if (!attribute) throw new AppError("Attribute not found", 400);

          const allowed = product.category.attributes.some(
            (a) => a.attribute.toString() === attr.attributeId,
          );
          if (!allowed)
            throw new AppError("Attribute not allowed for this category", 400);

          this.validateAttributeValue(attribute, attr.value);
          attributes.push({
            attribute: attribute._id,
            nameSnapshot: attribute.name,
            value: attr.value,
          });
        }

        let imageData = null;
        if (imageFile) {
          imageData = await ImageService.uploadSingle({
            file: imageFile,
            folder: "products/variants",
          });
          uploadedImages.push(imageData.publicId);
        }

        if (
          product.discountPrice?.discountType === "fixed" &&
          product.discountPrice?.discountValue >= variant.salePrice
        ) {
          throw new AppError(
            `Variant sale price (${variant.salePrice}) cannot be less than or equal to the product's fixed discount (${product.discountPrice.discountValue})`,
            400,
          );
        }

        const finalPrice = ProductVariant.calcFinalPrice(
          variant.salePrice,
          product.discountPrice?.discountType,
          product.discountPrice?.discountValue,
          product.discountPrice?.from,
          product.discountPrice?.to,
        );

        const entity = ProductVariant.createProductVariant({
          product: productId,
          productName,
          attributes,
          image: imageData
            ? { fileName: imageData.publicId, size: imageData.size }
            : null,
          originalPrice: variant.originalPrice,
          salePrice: variant.salePrice,
          finalPrice,
          stock: variant.stock,
          sku: variant.sku,
          createdBy: loggedInUser.id,
        });

        const saved = await this.variantRepo.create(entity);
        savedVariants.push(saved);
      }

      return savedVariants.map((v) => new ProductVariantResponseDTO(v));
    } catch (error) {
      if (uploadedImages.length) {
        await ImageService.deleteMany(uploadedImages);
      }
      throw error;
    }
  }

  validateAttributeValue(attribute, value) {
    switch (attribute.type) {
      case "number":
        if (typeof value !== "number")
          throw new AppError("Invalid number", 400);
        break;
      case "boolean":
        if (typeof value !== "boolean")
          throw new AppError("Invalid boolean", 400);
        break;
      case "select":
        if (!attribute.options.includes(value)) {
          throw new AppError("Invalid option", 400);
        }
        break;
    }
  }
}

module.exports = CreateProductVariantsUseCase;
