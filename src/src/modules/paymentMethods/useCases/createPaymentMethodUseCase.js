const AppError = require("../../../core/errors/appError");
const PaymentMethodRepository = require("../repositories/paymentMethodRepository");
const ImageService = require("../../../shared/services/imageUploadService");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class CreatePaymentMethodUseCase {
  constructor() {
    this.paymentMethodRepo = new PaymentMethodRepository();
  }

  async execute(loggedInUser, body, imageFile) {
    await assertAdminPermission(loggedInUser, "paymentMethods.create");

    const { nameEn, nameAr, descriptionEn, descriptionAr, isActive, key } =
      body;

    if (!nameEn || !nameAr) {
      throw new AppError(
        "Payment method name in both English and Arabic is required",
        400,
      );
    }

    if (!key || typeof key !== "string" || !key.trim()) {
      throw new AppError("Payment method key is required", 400);
    }
    const normalizedKey = key.trim().toLowerCase();

    const existing = await this.paymentMethodRepo.findOne({
      "name.en": { $regex: `^${nameEn}$`, $options: "i" },
    });
    if (existing) {
      throw new AppError("A payment method with this name already exists", 400);
    }

    const existingKey = await this.paymentMethodRepo.findOne({
      key: normalizedKey,
    });
    if (existingKey) {
      throw new AppError("A payment method with this key already exists", 400);
    }

    let imageData = null;
    try {
      if (imageFile) {
        imageData = await ImageService.uploadSingle({
          file: imageFile,
          folder: "payment-methods",
        });
      }

      const paymentMethod = await this.paymentMethodRepo.create({
        name: { en: nameEn, ar: nameAr },
        key: normalizedKey,
        description: {
          en: descriptionEn ?? null,
          ar: descriptionAr ?? null,
        },
        isActive: isActive ?? true,
        image: imageData
          ? { fileName: imageData.publicId, size: imageData.size }
          : undefined,
        createdBy: loggedInUser.id,
      });

      return paymentMethod;
    } catch (error) {
      if (imageData?.publicId) {
        await ImageService.delete(imageData.publicId);
      }
      throw error;
    }
  }
}

module.exports = CreatePaymentMethodUseCase;
