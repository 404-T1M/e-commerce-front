const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class OrderResponseDTO {
  constructor(order) {
    this.id = order._id;
    this.orderNumber = order.orderNumber;
    this.status = order.status;
    this.paymentStatus = order.paymentStatus;
    const user = order.user;
    if (user && typeof user === "object" && (user._id || user.name || user.email || user.mobilePhone)) {
      this.customer = {
        id: user._id,
        name: user.name,
        email: user.email,
        mobilePhone: user.mobilePhone,
      };
    } else if (user) {
      this.customer = { id: user };
    } else {
      this.customer = null;
    }

    this.items = order.items.map((item) => ({
      variantId: item.variant,
      productName: item.productName,
      attributes: item.attributes,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.total,
      image: item.image?.fileName
        ? {
            fileName: item.image.fileName,
            imageUrl: buildImageUrl(item.image.fileName, {
              crop: "fill",
              quality: "auto",
              fetch_format: "auto",
            }),
          }
        : null,
    }));

    this.address = order.address;
    this.shippingMethod = order.shippingMethod;
    this.paymentMethod = order.paymentMethod
      ? { key: order.paymentMethod.key, name: order.paymentMethod.name }
      : null;
    this.coupon = order.coupon ?? null;
    this.pricing = order.pricing;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }
}

module.exports = OrderResponseDTO;
