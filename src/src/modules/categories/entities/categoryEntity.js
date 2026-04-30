const slugify = require("slugify");

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.parent = data.parent;
    this.attributes = data.attributes;
    this.order = data.order;
    this.published = data.published;
    this.image = data.image
      ? {
          fileName: data.image.fileName,
          size: data.image.size,
        }
      : null;

    this.isFeatured = data.isFeatured;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
  }

  static slugifyName(nameEn) {
    return slugify(nameEn, { lower: true, strict: true });
  }

  static createCategory(body) {
    return new Category({
      name: {
        en: body.nameEn,
        ar: body.nameAr,
      },
      slug: this.slugifyName(body.nameEn),
      description: {
        en: body.descriptionEn ?? null,
        ar: body.descriptionAr ?? null,
      },
      parent: body.parent ?? null,
      attributes: body.attributes ?? null,
      order: body.order,
      published: body.published ?? false,
      image: body.image,
      createdBy: body.createdBy,
      isFeatured: body.isFeatured ?? false,
    });
  }
}

module.exports = Category;
