const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class CouponResponseDTO {
  constructor(coupon) {
    this.id = coupon._id;
    this.code = coupon.code;

    this.discount = {
      type: coupon.discountType,
      value: coupon.discountValue,
    };

    this.validity = {
      startsAt: coupon.startsAt || null,
      endsAt: coupon.endsAt || null,
    };

    this.conditions = {
      minOrderTotal: coupon.minOrderTotal,
      maxDiscountAmount: coupon.maxDiscountAmount || null,
    };

    this.applicableCategories = (coupon.applicableCategories || []).map(
      (cat) =>
        typeof cat === "object"
          ? {
              id: cat._id,
              name: cat.name,
            }
          : { id: cat },
    );

    this.applicableProducts = (coupon.applicableProducts || []).map((p) => {
      if (typeof p !== "object") return { id: p };

      const image = p.images?.[0];

      return {
        id: p._id,
        name: p.name,
        image: image
          ? {
              fileName: image.fileName,
              size: image.size,
              imageUrl: buildImageUrl(image.fileName, {
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
              }),
            }
          : null,
      };
    });

    this.allowedUsers = (coupon.allowedUsers || []).map((u) => {
      if (typeof u !== "object") return { id: u };

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        image: u.profileImage
          ? {
              fileName: u.profileImage.fileName,
              size: u.profileImage.size,
              imageUrl: buildImageUrl(u.profileImage.fileName, {
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
              }),
            }
          : null,
      };
    });

    this.usage = {
      usageLimit: coupon.usageLimit || null,
      usedCount: coupon.usedCount,
      allowMultiplePerUser: coupon.allowMultiplePerUser,
    };

    this.status = {
      isActive: coupon.isActive,
    };

    this.createdBy =
      coupon.createdBy && typeof coupon.createdBy === "object"
        ? {
            id: coupon.createdBy._id,
            name: coupon.createdBy.name,
            email: coupon.createdBy.email,
            image: coupon.createdBy.profileImage
              ? {
                  fileName: coupon.createdBy.profileImage.fileName,
                  size: coupon.createdBy.profileImage.size,
                  imageUrl: buildImageUrl(
                    coupon.createdBy.profileImage.fileName,
                    {
                      crop: "fill",
                      quality: "auto",
                      fetch_format: "auto",
                    },
                  ),
                }
              : null,
          }
        : coupon.createdBy;

    this.createdAt = coupon.createdAt;
  }
}

module.exports = CouponResponseDTO;
