const OrderReview = require("../../modules/orderReviews/model/orderReviewModel");
const Product = require("../../modules/products/models/productModel");
const mongoose = require("mongoose");

function normalizeProductId(productRef) {
  if (!productRef) return null;

  const rawId =
    typeof productRef === "object" && productRef._id
      ? productRef._id
      : productRef;

  if (!mongoose.Types.ObjectId.isValid(rawId)) return null;

  return new mongoose.Types.ObjectId(rawId);
}

async function syncProductRating(productId) {
  const normalizedProductId = normalizeProductId(productId);
  if (!normalizedProductId) return;

  const result = await OrderReview.aggregate([
    { $match: { product: normalizedProductId, published: true } },
    {
      $group: {
        _id: null,
        total: { $sum: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const stats =
    result.length > 0
      ? { total: result[0].total, count: result[0].count }
      : { total: 0, count: 0 };

  const avg =
    stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0;

  await Product.findByIdAndUpdate(normalizedProductId, {
    "rating.avg": avg,
    "rating.count": stats.count,
    "rating.total": stats.total,
  });
}

module.exports = { syncProductRating };
