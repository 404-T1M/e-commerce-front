const cron = require("node-cron");
const Coupon = require("../modules/coupons/models/couponModel");

const startCouponCron = () => {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log("[Cron] Coupons status Starts");

    try {
      // Activate coupons
      await Coupon.updateMany(
        {
          isActive: false,
          startsAt: { $lte: now },
          $or: [
            { endsAt: { $exists: false } },
            { endsAt: null },
            { endsAt: { $gt: now } },
          ],
        },
        { $set: { isActive: true } },
      );

      // Deactivate expired coupons
      await Coupon.updateMany(
        {
          isActive: true,
          endsAt: { $lte: now },
        },
        { $set: { isActive: false } },
      );

      console.log("[Cron] Coupons status updated");
    } catch (err) {
      console.error("[Cron] Coupon cron failed:", err.message);
    }
  });
};

module.exports = startCouponCron;
