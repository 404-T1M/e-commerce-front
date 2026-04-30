const express = require("express");
const globalError = require("./core/errors/globalErrors");
const app = express();
app.use(express.json());

//ROUTES
const usersRoutes = require("./modules/users/routes/usersRoutes");
const adminGroupRoutes = require("./modules/administratorsGroup/routes/adminGroupRoutes");
const categoriesRoutes = require("./modules/categories/routes/categoryRoutes");
const productsRoutes = require("./modules/products/routes/productRoutes");
const productsVariantRoutes = require("./modules/products/routes/variantsRoutes");
const attributeRoutes = require("./modules/attributes/routes/attributeRoutes");
const cartRoutes = require("./modules/cart/routes/cartRoutes");
const couponRoutes = require("./modules/coupons/routes/couponRoutes");
const customerAddressesRoutes = require("./modules/customerAddresses/routes/customersAddressesRoutes");
const shippingMethodRoutes = require("./modules/shippingMethods/routes/shippingMethodRoutes");
const paymentMethodRoutes = require("./modules/paymentMethods/routes/paymentMethodRoutes");
const orderRoutes = require("./modules/orders/routes/orderRoutes");
const walletRoutes = require("./modules/customerWallet/routes/walletRoutes");
const reviewRoutes = require("./modules/orderReviews/routes/reviewRoutes");
const bannerRoutes = require("./modules/banners/routes/bannerRoutes");
const sectionRoutes = require("./modules/sections/routes/sectionRoutes");
const analyticsRoutes = require("./modules/analytics/routes/analyticsRoutes");

app.use("/api/v1", usersRoutes);
app.use("/api/v1/admin", adminGroupRoutes);
app.use("/api/v1", categoriesRoutes);
app.use("/api/v1", productsRoutes);
app.use("/api/v1", productsVariantRoutes);
app.use("/api/v1", attributeRoutes);
app.use("/api/v1", couponRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", customerAddressesRoutes);
app.use("/api/v1", shippingMethodRoutes);
app.use("/api/v1", paymentMethodRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", walletRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1", bannerRoutes);
app.use("/api/v1", sectionRoutes);
app.use("/api/v1", analyticsRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(globalError);
module.exports = app;
