const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class CartResponseDTO {
  constructor(cart) {
    this.id = cart._id;
    this.items = cart.items.map((item) => {
      const variant = item.variant;
      const product = variant.product;
      const image = variant.image;

      const available =
        product &&
        product.published &&
        !product.isDeleted &&
        variant.published &&
        !variant.isDeleted &&
        variant.stock >= item.quantity;

      return {
        variantId: variant._id,
        variantStock: variant.stock,
        product: {
          id: product._id,
          name: product.name,
        },
        image: image
          ? {
              fileName: image.fileName,
              imageSize: image.size,
              imageUrl: buildImageUrl(image.fileName, {
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
              }),
            }
          : null,
        price: item.priceSnapshot,
        quantity: item.quantity,
        available,
        total: item.priceSnapshot * item.quantity,
      };
    });

    this.totalPrice = this.items.reduce((sum, item) => sum + item.total, 0);

    this.createdAt = cart.createdAt;
  }
}

module.exports = CartResponseDTO;
