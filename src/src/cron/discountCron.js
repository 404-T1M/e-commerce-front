const cron = require("node-cron");
const Product = require("../modules/products/models/productModel");
const ProductVariant = require("../modules/products/models/productVariantModel");

const startDiscountCron = () => {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log("[Cron] Discount job started");

    try {
      const [activatedProducts, expiredProducts] = await Promise.all([
        Product.find({
          "discountPrice.discountValue": { $gt: 0 },
          "discountPrice.active": false,
          $and: [
            {
              $or: [
                { "discountPrice.from": { $lte: now } },
                { "discountPrice.from": null },
              ],
            },
            {
              $or: [
                { "discountPrice.to": { $gte: now } },
                { "discountPrice.to": null },
              ],
            },
          ],
        }).select("_id discountPrice"),

        Product.find({
          "discountPrice.active": true,
          "discountPrice.to": { $lt: now },
        }).select("_id"),
      ]);

      if (!activatedProducts.length && !expiredProducts.length) {
        console.log("[Cron] No discounts to process, skipping.");
        return;
      }

      if (activatedProducts.length) {
        await Promise.all(
          activatedProducts.map((product) => {
            const { discountType, discountValue } = product.discountPrice;

            return ProductVariant.updateMany(
              { product: product._id },
              [
                {
                  $set: {
                    "price.finalPrice": {
                      $cond: [
                        { $eq: [discountType, "PERCENT"] },
                        {
                          $subtract: [
                            "$price.salePrice",
                            {
                              $multiply: [
                                "$price.salePrice",
                                { $divide: [discountValue, 100] },
                              ],
                            },
                          ],
                        },
                        {
                          $subtract: ["$price.salePrice", discountValue],
                        },
                      ],
                    },
                  },
                },
              ],
              { updatePipeline: true },
            );
          }),
        );

        await Product.updateMany(
          { _id: { $in: activatedProducts.map((p) => p._id) } },
          { $set: { "discountPrice.active": true } },
        );

        console.log(
          `[Cron] Activated discounts for ${activatedProducts.length} product(s)`,
        );
      }

      if (expiredProducts.length) {
        const expiredIds = expiredProducts.map((p) => p._id);

        await Promise.all([
          Product.updateMany(
            { _id: { $in: expiredIds } },
            {
              $set: {
                "discountPrice.active": false,
                "discountPrice.discountType": null,
                "discountPrice.discountValue": null,
                "discountPrice.from": null,
                "discountPrice.to": null,
              },
            },
          ),
          ProductVariant.updateMany(
            { product: { $in: expiredIds } },
            [{ $set: { "price.finalPrice": "$price.salePrice" } }],
            { updatePipeline: true },
          ),
        ]);

        console.log(
          `[Cron] Deactivated discounts for ${expiredProducts.length} product(s)`,
        );
      }

      console.log("[Cron] Discount job finished");
    } catch (error) {
      console.error("[Cron] Discount job failed:", error);
    }
  });
};

module.exports = startDiscountCron;
