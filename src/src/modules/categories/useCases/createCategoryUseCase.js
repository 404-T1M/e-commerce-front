const AppError = require("../../../core/errors/appError");
const Category = require("../entities/categoryEntity");
const CategoryRepository = require("../repositories/categoryRepository");
const AttributeRepository = require("../../attributes/repositories/attributeRepository");
const CategoryDataResponseDTO = require("../DTO/categoryDataResponseDTO");
const ImageService = require("../../../shared/services/imageUploadService");
const {
  assertAdminPermission,
} = require("../../../core/authorization/checkAdminAndHisPermission");

class CreateCategoryUseCase {
  constructor() {
    this.categoryRepo = new CategoryRepository();
    this.attributeRepo = new AttributeRepository();
  }

  async execute(loggedInUser, body, imageFile) {
    await assertAdminPermission(loggedInUser, "categories.create");

    if (!body.nameEn || !body.nameAr) {
      throw new AppError("Category name (en, ar) and order are required", 400);
    }
    if (!imageFile) {
      throw new AppError("Category Icon is Required", 400);
    }

    if (body.parent) {
      const parent = await this.categoryRepo.findOne({ _id: body.parent });
      if (!parent) {
        throw new AppError("Parent category not found", 400);
      }
    }

    let validatedAttributes = [];
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

    let imageData;
    try {
      imageData = await ImageService.uploadSingle({
        file: imageFile,
        folder: "categories",
      });

      const data = Category.createCategory({
        ...body,
        attributes: validatedAttributes,
        image: {
          fileName: imageData.publicId,
          size: imageData.size,
        },
        createdBy: loggedInUser.id,
      });
      const savedCategory = await this.categoryRepo.create(data);

      return new CategoryDataResponseDTO(savedCategory);
    } catch (error) {
      if (imageData?.publicId) {
        await ImageService.delete(imageData.publicId);
      }
      throw error;
    }
  }
}

module.exports = CreateCategoryUseCase;
