const ProductVariantRepository = require("../../repositories/productVariantRepository");
const ProductRepository = require("../../repositories/productRepository");
const AttributeRepository = require("../../../attributes/repositories/attributeRepository");
const ProductVariant = require("../../entities/productVariantsEntity");
const AppError = require("../../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../../core/authorization/checkAdminAndHisPermission");
const ImageService = require("../../../../shared/services/imageUploadService");
const ProductVariantResponseDTO = require("../../DTO/productVariantResponseDTO");

class UpdateProductVariantUseCase {
  constructor() {
    this.variantRepo = new ProductVariantRepository();
    this.productRepo = new ProductRepository();
    this.attributeRepo = new AttributeRepository();
  }

  async execute(loggedInUser, variantId, body, imageFile) {
    await assertAdminPermission(loggedInUser, "products.update");

    const variant = await this.variantRepo.findOne({
      _id: variantId,
      isDeleted: false,
    });
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    const product = await this.productRepo.findOne(
      { _id: variant.product, isDeleted: false },
      { populateCategory: true },
    );
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    let newImage = null;
    const oldImageId = variant.image?.fileName;

    try {
      let attributes = variant.attributes;

      if (Array.isArray(body.attributes)) {
        attributes = [];

        for (const attr of body.attributes) {
          const attribute = await this.attributeRepo.findOne({
            _id: attr.attributeId,
          });
          if (!attribute) {
            throw new AppError("Attribute not found", 400);
          }

          const allowed = product.category.attributes.some(
            (a) => a.attribute.toString() === attr.attributeId,
          );
          if (!allowed) {
            throw new AppError("Attribute not allowed for this category", 400);
          }

          this.validateAttributeValue(attribute, attr.value);

          attributes.push({
            attribute: attribute._id,
            nameSnapshot: attribute.name,
            value: attr.value,
          });
        }
      }

      if (imageFile) {
        newImage = await ImageService.uploadSingle({
          file: imageFile,
          folder: "products/variants",
        });
      }

      const salePrice = body.salePrice ?? variant.price.salePrice;

      if (
        product.discountPrice?.discountType === "fixed" &&
        product.discountPrice?.discountValue >= salePrice
      ) {
        throw new AppError(
          `Variant sale price (${salePrice}) cannot be less than or equal to the product's fixed discount (${product.discountPrice.discountValue})`,
          400,
        );
      }

      const finalPrice = ProductVariant.calcFinalPrice(
        salePrice,
        product.discountPrice?.discountType,
        product.discountPrice?.discountValue,
        product.discountPrice?.from,
        product.discountPrice?.to,
      );

      const updated = await this.variantRepo.updateOne(
        { _id: variantId },
        {
          attributes,
          image: newImage
            ? { fileName: newImage.publicId, size: newImage.size }
            : variant.image,
          price: {
            originalPrice: body.originalPrice ?? variant.price.originalPrice,
            salePrice,
            finalPrice,
          },
          stock: body.stock ?? variant.stock,
          updatedBy: loggedInUser.id,
        },
      );

      if (newImage && oldImageId) {
        await ImageService.delete(oldImageId);
      }

      return new ProductVariantResponseDTO(updated);
    } catch (error) {
      if (newImage?.publicId) {
        await ImageService.delete(newImage.publicId);
      }
      throw error;
    }
  }

  validateAttributeValue(attribute, value) {
    switch (attribute.type) {
      case "number":
        if (typeof value !== "number")
          throw new AppError("Invalid number attribute", 400);
        break;
      case "boolean":
        if (typeof value !== "boolean")
          throw new AppError("Invalid boolean attribute", 400);
        break;
      case "select":
        if (!attribute.options.includes(value))
          throw new AppError("Invalid attribute option", 400);
        break;
      default:
        throw new AppError("Unsupported attribute type", 400);
    }
  }
}

module.exports = UpdateProductVariantUseCase;
