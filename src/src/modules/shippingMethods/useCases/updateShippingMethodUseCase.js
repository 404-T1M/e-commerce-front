const AppError = require("../../../core/errors/appError");
const ShippingMethodRepository = require("../repositories/shippingMethodRepository");
const ImageService = require("../../../shared/services/imageUploadService");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

const ENGLISH_NAME_COLLATION = { locale: "en", strength: 2 };
const ARABIC_NAME_COLLATION = { locale: "ar", strength: 2 };

class UpdateShippingMethodUseCase {
  constructor() {
    this.shippingMethodRepo = new ShippingMethodRepository();
  }

  async execute(loggedInUser, shippingMethodId, body, imageFile) {
    await assertAdminPermission(loggedInUser, "shippingMethods.update");

    const shippingMethod = await this.shippingMethodRepo.findOne({
      _id: shippingMethodId,
    });
    if (!shippingMethod) {
      throw new AppError("Shipping Method Not Found", 404);
    }

    const updates = {};

    if (body.nameEn || body.nameAr) {
      let existingNameEn;
      let existingNameAr;

      if (typeof shippingMethod.name === "string") {
        existingNameEn = shippingMethod.name;
        existingNameAr = shippingMethod.name;
      } else if (
        shippingMethod.name &&
        typeof shippingMethod.name === "object"
      ) {
        existingNameEn = shippingMethod.name.en;
        existingNameAr = shippingMethod.name.ar;
      }

      const newNameEn = body.nameEn ?? existingNameEn;
      const newNameAr = body.nameAr ?? existingNameAr;

      if (newNameEn == null || newNameAr == null) {
        throw new AppError(
          "Both English and Arabic names must be provided or resolvable from existing data",
          400,
        );
      }

      if (body.nameEn) {
        const existing = await this.shippingMethodRepo.findOne(
          { "name.en": body.nameEn },
          { collation: ENGLISH_NAME_COLLATION },
        );
        if (existing && existing._id.toString() !== shippingMethodId) {
          throw new AppError(
            "A shipping method with this name already exists",
            400,
          );
        }
      }

      if (body.nameAr) {
        const existing = await this.shippingMethodRepo.findOne(
          { "name.ar": body.nameAr },
          { collation: ARABIC_NAME_COLLATION },
        );
        if (existing && existing._id.toString() !== shippingMethodId) {
          throw new AppError(
            "A shipping method with this name already exists",
            400,
          );
        }
      }

      updates.name = { en: newNameEn, ar: newNameAr };
    }

    if (body.descriptionEn !== undefined || body.descriptionAr !== undefined) {
      updates.description = {
        en: body.descriptionEn ?? shippingMethod.description?.en ?? null,
        ar: body.descriptionAr ?? shippingMethod.description?.ar ?? null,
      };
    }

    if (body.price != null) {
      if (body.price < 0) {
        throw new AppError("Price must be 0 or greater", 400);
      }
      updates.price = body.price;
    }

    if (body.estimatedDeliveryDays != null) {
      if (body.estimatedDeliveryDays < 0) {
        throw new AppError("Estimated delivery days must be 0 or greater", 400);
      }
      updates.estimatedDeliveryDays = body.estimatedDeliveryDays;
    }

    if (body.isActive != null) {
      updates.isActive = body.isActive;
    }

    const oldImageId = shippingMethod.image?.fileName;
    let imageData = null;

    try {
      if (imageFile) {
        imageData = await ImageService.uploadSingle({
          file: imageFile,
          folder: "shipping-methods",
        });
        updates.image = {
          fileName: imageData.publicId,
          size: imageData.size,
        };
      }

      const updated = await this.shippingMethodRepo.updateOne(
        { _id: shippingMethodId },
        updates,
      );

      // Delete old image from Cloudinary after successful update
      if (imageData && oldImageId) {
        await ImageService.delete(oldImageId);
      }

      return updated;
    } catch (error) {
      if (imageData?.publicId) {
        await ImageService.delete(imageData.publicId);
      }

      if (error?.code === 11000) {
        throw new AppError("A shipping method with this name already exists", 400);
      }

      throw error;
    }
  }
}

module.exports = UpdateShippingMethodUseCase;
