class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.images = data.images;
    this.category = data.category;
    this.discountPrice = data.discountPrice;
    this.published = data.published;
    this.createdBy = data.createdBy;
    this.isDeleted = data.isDeleted;
  }

  static createProduct(product) {
    return new Product({
      name: product.name,
      description: product.description,
      category: product.category,
      discountPrice: product.discountPrice,
      images: product.images,
      createdBy: product.createdBy,
    });
  }
}

module.exports = Product;
