const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");
class ProductResponseDTO {
  constructor(product) {
    this.id = product._id;
    this.name = product.name;
    this.description = product.description;
    this.images = (product.images || []).map((img) => ({
      fileName: img.fileName,
      imageSize: img.size,
      imageUrl: buildImageUrl(img.fileName, {
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
      }),
    }));

    this.category = product.category;
    this.attributes = product.attributes;
    this.price =
      product.minPrice !== undefined
        ? product.minPrice
        : product.price
          ? product.price.finalPrice
          : null;
    this.discountPrice = product.discountPrice;
    this.published = product.published;
    this.sku = product.sku;
    this.stock = product.stock;
    if (product.createdBy && product.createdBy.name) {
      this.createdBy = {
        _id: product.createdBy._id,
        name: product.createdBy.name,
        email: product.createdBy.email,
      };
    } else if (product.createdBy) {
      this.createdBy = product.createdBy;
    } else {
      this.createdBy = null;
    }

    this.startingPrice = product.minPrice;
    if (product.variants && product.variants.length > 0) {
      const cheapest = product.variants[0];
      this.cheapestVariant = {
        _id: cheapest._id,
        price: cheapest.price,
        image: cheapest.image,
        attributes: cheapest.attributes,
      };
    }
    this.rating = {
      avg: product.rating?.avg ?? 0,
      count: product.rating?.count ?? 0,
      total: product.rating?.total ?? 0,
    };
    this.createdAt = product.createdAt;
  }
}

module.exports = ProductResponseDTO;
