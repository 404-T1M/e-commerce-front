class AdminGroupPermission {
    async getAllPermissions() {
        return [
          "customers.list",
          "customers.create",
          "customers.update",
          "customers.delete",

          "users.list",
          "users.create",
          "users.update",
          "users.delete",

          "adminGroups.list",
          "adminGroups.create",
          "adminGroups.update",
          "adminGroups.delete",

          "attributes.list",
          "attributes.create",
          "attributes.delete",

          "categories.list",
          "categories.create",
          "categories.update",
          "categories.delete",

          "products.list",
          "products.create",
          "products.update",
          "products.delete",

          "orders.list",
          "orders.update",
          "orders.delete",
          "orders.view",

          "orderReviews.list",
          "orderReviews.update",
          "orderReviews.delete",

          "wallet.list",
          "wallet.credit",

          "coupons.list",
          "coupons.create",
          "coupons.update",
          "coupons.delete",

          "shippingMethods.list",
          "shippingMethods.create",
          "shippingMethods.update",
          "shippingMethods.delete",

          "paymentMethods.list",
          "paymentMethods.create",
          "paymentMethods.update",
          "paymentMethods.delete",

          "contactUs.list",
          "contactUs.create",
          "contactUs.update",
          "contactUs.delete",

          "faq.list",
          "faq.create",
          "faq.update",
          "faq.delete",

          "banners.list",
          "banners.create",
          "banners.update",
          "banners.delete",

          "sections.list",
          "sections.create",
          "sections.update",
          "sections.delete",

          "settings.view",
          "settings.update",

          "reports.overview",
          "reports.coupons",
          "reports.products",
          "reports.customers",
          "reports.daily",
          "reports.profit",
        ]
    }
}

module.exports = new AdminGroupPermission();