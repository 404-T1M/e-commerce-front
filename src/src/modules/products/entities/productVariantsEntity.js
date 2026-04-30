const AppError = require("../../../core/errors/appError");

class ProductVariant {
  constructor(data) {
    this.id = data._id;
    this.product = data.product;
    this.image = data.image;
    this.attributes = data.attributes;
    this.price = data.price;
    this.published = data.published;
    this.sku = data.sku;
    this.stock = data.stock;
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.isDeleted = data.isDeleted;
  }

  static createProductVariant(body) {
    return new ProductVariant({
      product: body.product,
      attributes: body.attributes,
      image: body.image ?? null,
      price: {
        originalPrice: body.originalPrice,
        salePrice: body.salePrice,
        finalPrice: body.finalPrice,
      },
      sku:
        body.sku ||
        ProductVariant.generateSku({
          productId: body.product,
          productName: body.productName,
          attributes: body.attributes,
        }),
      stock: body.stock,
      createdBy: body.createdBy,
    });
  }

  static generateSku({ productName, attributes = [] }) {
    const maxLength = 16;

    const clean = (value) =>
      String(value ?? "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    const namePart = clean(productName).slice(0, 3);

    const attrChars = [];
    if (Array.isArray(attributes)) {
      for (const attr of attributes) {
        if (attrChars.length >= 3) break;
        const value = attr?.value ?? attr;
        const char = clean(value).charAt(0);
        if (char) attrChars.push(char);
      }
    }

    const base = (namePart + attrChars.join("")).slice(0, 6);
    const remaining = Math.max(maxLength - base.length, 0);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPart = "";
    for (let i = 0; i < remaining; i++) {
      randomPart += chars[Math.floor(Math.random() * chars.length)];
    }

    return (base + randomPart).slice(0, maxLength);
  }
  static calcFinalPrice(
    salePrice,
    discountType,
    discountValue,
    fromDate,
    toDate,
  ) {
    let finalPrice = salePrice;

    if (discountType && discountValue) {
      let isValidDate = true;
      const now = Date.now();

      if (fromDate) {
        const fromTime = new Date(fromDate).getTime();
        if (now < fromTime) isValidDate = false;
      }

      if (toDate) {
        const toTime = new Date(toDate).getTime();
        if (now > toTime) isValidDate = false;
      }

      if (isValidDate) {
        finalPrice =
          discountType === "percentage"
            ? salePrice - (salePrice * discountValue) / 100
            : salePrice - discountValue;
      }
    }

    return Math.max(finalPrice, 0);
  }

  deletedProduct() {
    if (this.isDeleted) {
      throw new AppError("Product is Deleted");
    }
  }
}

module.exports = ProductVariant;
