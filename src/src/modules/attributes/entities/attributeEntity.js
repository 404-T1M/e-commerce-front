class Attribute {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.options = data.options;
    this.isDeleted = data.isDeleted;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
  }

  static createAttribute(body) {
    return new Attribute({
      name: {
        en: body.nameEn.trim(),
        ar: body.nameAr.trim(),
      },
      type: body.type,
      options: body.type === "select" ? body.options : [],
      createdBy: body.createdBy,
    });
  }
}

module.exports = Attribute;
