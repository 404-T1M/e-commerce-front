const CategoryRepository = require("../repositories/categoryRepository");
const AttributeRepository = require("../../attributes/repositories/attributeRepository");
const categoryEntity = require("../entities/categoryEntity");
const CategoryDataResponseDTO = require("../DTO/categoryDataResponseDTO");
const AppError = require("../../../core/errors/appError");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");
const ImageService = require("../../../shared/services/imageUploadService");

class UpdateCategoryUseCase {
  constructor() {
    this.categoryRepo = new CategoryRepository();
    this.attributeRepo = new AttributeRepository();
  }

  async execute(loggedInUser, categoryId, body, imageFile) {
    await assertAdminPermission(loggedInUser, "categories.update");

    const category = await this.categoryRepo.findOne({ _id: categoryId });
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    let oldImageId = category.image?.fileName;
    let imageData = null;
    let slug = null;
    let validatedAttributes = [];

    if (body.parent) {
      const parent = await this.categoryRepo.findOne({ _id: body.parent });
      if (!parent || parent._id.equals(category._id)) {
        throw new AppError("Invalid parent category", 400);
      }
    }

    if (body.attributes?.length) {
      const attributeIds = body.attributes.map((a) => a.attribute);

      const attributes = await this.attributeRepo.find({
        _id: { $in: attributeIds },
        isDeleted: false,
      });

      if (attributes.length !== attributeIds.length) {
        throw new AppError("One or more attributes are invalid", 400);
      }

      validatedAttributes = body.attributes.map((attr) => ({
        attribute: attr.attribute,
        required: !!attr.required,
      }));
    }

    try {
      if (imageFile) {
        imageData = await ImageService.uploadSingle({
          file: imageFile,
          folder: "categories",
        });
      }

      if (body.nameEn || body.nameAr) {
        slug = categoryEntity.slugifyName(body.nameEn);
      }

      const updated = await this.categoryRepo.updateOne(
        { _id: categoryId },
        {
          name: {
            en: body.nameEn ?? category.name.en,
            ar: body.nameAr ?? category.name.ar,
          },
          slug: slug ? slug : category.slug,
          description: {
            en: body.descriptionEn ?? category.description.en,
            ar: body.descriptionAr ?? category.description.ar,
          },
          parent: body.parent ?? category.parent,
          attributes: body.attributes
            ? validatedAttributes
            : category.attributes,
          image: imageFile
            ? {
                fileName: imageData.publicId,
                size: imageData.size,
              }
            : category.image,

          isFeatured:
            body.isFeatured !== undefined
              ? body.isFeatured
              : category.isFeatured,
        },
      );

      if (imageData && oldImageId) {
        await ImageService.delete(oldImageId);
      }

      return new CategoryDataResponseDTO(updated);
    } catch (error) {
      if (imageData?.publicId) {
        await ImageService.delete(imageData.publicId);
      }
      throw error;
    }
  }
}

module.exports = UpdateCategoryUseCase;
