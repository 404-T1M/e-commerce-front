require("dotenv").config();
const connectDB = require("./config/database");
const app = require("./app");
const startDiscountCron = require("./cron/discountCron");
const startCouponCron = require("./cron/couponDiscount");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
      // startDiscountCron();
      // startCouponCron();
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
