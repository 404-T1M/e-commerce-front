const AppError = require("../../../core/errors/appError");
const ShippingMethodRepository = require("../repositories/shippingMethodRepository");
const ImageService = require("../../../shared/services/imageUploadService");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

const ENGLISH_NAME_COLLATION = { locale: "en", strength: 2 };
const ARABIC_NAME_COLLATION = { locale: "ar", strength: 2 };

class CreateShippingMethodUseCase {
  constructor() {
    this.shippingMethodRepo = new ShippingMethodRepository();
  }

  async execute(loggedInUser, body, imageFile) {
    await assertAdminPermission(loggedInUser, "shippingMethods.create");

    const {
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      price,
      estimatedDeliveryDays,
      isActive,
    } = body;

    if (!nameEn || !nameAr || price == null) {
      throw new AppError(
        "Name in both English and Arabic, and Price are required",
        400,
      );
    }

    if (price < 0) {
      throw new AppError("Price must be 0 or greater", 400);
    }

    if (estimatedDeliveryDays != null && estimatedDeliveryDays < 0) {
      throw new AppError("Estimated delivery days must be 0 or greater", 400);
    }

    const [existingEnglishName, existingArabicName] = await Promise.all([
      this.shippingMethodRepo.findOne(
        { "name.en": nameEn },
        { collation: ENGLISH_NAME_COLLATION },
      ),
      this.shippingMethodRepo.findOne(
        { "name.ar": nameAr },
        { collation: ARABIC_NAME_COLLATION },
      ),
    ]);

    if (existingEnglishName || existingArabicName) {
      throw new AppError(
        "A shipping method with this name already exists",
        400,
      );
    }

    let imageData = null;
    try {
      if (imageFile) {
        imageData = await ImageService.uploadSingle({
          file: imageFile,
          folder: "shipping-methods",
        });
      }

      const shippingMethod = await this.shippingMethodRepo.create({
        name: { en: nameEn, ar: nameAr },
        description: { en: descriptionEn ?? null, ar: descriptionAr ?? null },
        price,
        estimatedDeliveryDays,
        isActive: isActive ?? true,
        image: imageData
          ? { fileName: imageData.publicId, size: imageData.size }
          : undefined,
        createdBy: loggedInUser.id,
      });

      return shippingMethod;
    } catch (error) {
      if (imageData?.publicId) {
        await ImageService.delete(imageData.publicId);
      }
      throw error;
    }
  }
}

module.exports = CreateShippingMethodUseCase;
