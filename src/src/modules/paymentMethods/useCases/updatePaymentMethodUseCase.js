const AppError = require("../../../core/errors/appError");
const PaymentMethodRepository = require("../repositories/paymentMethodRepository");
const ImageService = require("../../../shared/services/imageUploadService");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class UpdatePaymentMethodUseCase {
  constructor() {
    this.paymentMethodRepo = new PaymentMethodRepository();
  }

  async execute(loggedInUser, paymentMethodId, body, imageFile) {
    await assertAdminPermission(loggedInUser, "paymentMethods.update");

    const paymentMethod = await this.paymentMethodRepo.findOne({
      _id: paymentMethodId,
    });
    if (!paymentMethod) {
      throw new AppError("Payment Method Not Found", 404);
    }

    const updates = {};

    if (body.nameEn || body.nameAr) {
      const newNameEn = body.nameEn ?? paymentMethod.name.en;
      const newNameAr = body.nameAr ?? paymentMethod.name.ar;

      if (body.nameEn) {
        const existing = await this.paymentMethodRepo.findOne({
          "name.en": { $regex: `^${body.nameEn}$`, $options: "i" },
        });
        if (existing && existing._id.toString() !== paymentMethodId) {
          throw new AppError(
            "A payment method with this name already exists",
            400,
          );
        }
      }

      updates.name = {
        en: newNameEn,
        ar: newNameAr,
      };
    }

    if (body.descriptionEn !== undefined || body.descriptionAr !== undefined) {
      updates.description = {
        en: body.descriptionEn ?? paymentMethod.description?.en ?? null,
        ar: body.descriptionAr ?? paymentMethod.description?.ar ?? null,
      };
    }

    if (body.isActive != null) {
      updates.isActive = body.isActive;
    }

    if (body.key !== undefined) {
      if (typeof body.key !== "string" || !body.key.trim()) {
        throw new AppError("Payment method key cannot be empty", 400);
      }
      const newKey = body.key.trim().toLowerCase();
      const existingKey = await this.paymentMethodRepo.findOne({ key: newKey });
      if (existingKey && existingKey._id.toString() !== paymentMethodId) {
        throw new AppError(
          "A payment method with this key already exists",
          400,
        );
      }
      updates.key = newKey;
    }

    const oldImageId = paymentMethod.image?.fileName;
    let imageData = null;

    try {
      if (imageFile) {
        imageData = await ImageService.uploadSingle({
          file: imageFile,
          folder: "payment-methods",
        });
        updates.image = {
          fileName: imageData.publicId,
          size: imageData.size,
        };
      }

      const updated = await this.paymentMethodRepo.updateOne(
        { _id: paymentMethodId },
        updates,
      );

      if (imageData && oldImageId) {
        await ImageService.delete(oldImageId);
      }

      return updated;
    } catch (error) {
      if (imageData?.publicId) {
        await ImageService.delete(imageData.publicId);
      }
      throw error;
    }
  }
}

module.exports = UpdatePaymentMethodUseCase;
