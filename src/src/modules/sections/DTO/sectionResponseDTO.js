const { buildImageUrl } = require("../../../shared/utils/imageUrlBuilder");

class SectionResponseDTO {
  constructor(section) {
    this.id = section._id;
    this.type = section.type;
    this.title = section.title;
    this.description = section.description;
    this.order = section.order;
    this.isActive = section.isActive;
    this.limit = section.limit;
    const bannerIds = section.data?.bannerIds ?? [];
    const categoryIds = section.data?.categoryIds ?? [];
    const productIds = section.data?.productIds ?? [];

    const hasPopulatedData = [bannerIds, categoryIds, productIds].some(
      (items) =>
        Array.isArray(items) &&
        items.some((item) => item && typeof item === "object" && item._id),
    );

    this.data = hasPopulatedData
      ? {
          banners:
            bannerIds
              .filter((banner) => banner && banner._id)
              .map((banner) => ({
                id: banner._id,
                title: banner.title,
                image: {
                  fileName: banner.image?.fileName,
                  size: banner.image?.size,
                  url: buildImageUrl(banner.image?.fileName),
                },
                link: banner.link,
              })) || [],

          categories:
            categoryIds
              .filter((category) => category && category._id)
              .map((category) => ({
                id: category._id,
                name: category.name,
                image: {
                  fileName: category.image?.fileName,
                  size: category.image?.size,
                  url: buildImageUrl(category.image?.fileName),
                },
              })) || [],
          products:
            productIds
              .filter((product) => product && product._id)
              .map((product) => {
                const primaryImage = product.images?.[0];
                return {
                  id: product._id,
                  name: product.name,
                  image: {
                    fileName: primaryImage?.fileName,
                    size: primaryImage?.size,
                    url: buildImageUrl(primaryImage?.fileName),
                  },
                  discountPrice: product.discountPrice,
                };
              }) || [],
        }
      : {
          bannerIds: bannerIds,
          categoryIds: categoryIds,
          productIds: productIds,
        };
    this.createdBy = section.createdBy;
    this.createdAt = section.createdAt;
  }
}

module.exports = SectionResponseDTO;
