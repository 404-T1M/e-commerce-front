const Cart = require("../models/cartModel");

class CartRepository {
  async findByUser(userId) {
    return await Cart.findOne({ user: userId }).populate({
      path: "items.variant",
      select: "price image product attributes stock published isDeleted",
      populate: {
        path: "product",
        select: "name published isDeleted category",
      },
    });
  }

  async create(cart) {
    return await Cart.create(cart);
  }

  async save(cart, options = {}) {
    let savedCart = await cart.save();

    if (options.populateProduct) {
      await savedCart.populate({
        path: "items.variant",
        select: "price image product stock published isDeleted",
        populate: {
          path: "product",
          select: "name published isDeleted category",
        },
      });
    }

    return savedCart;
  }

  async updateOne(filter, update) {
    return await Cart.findOneAndUpdate(filter, update, {
      new: true,
    });
  }

  async deleteByUser(userId) {
    return await Cart.findOneAndDelete({ user: userId });
  }
}

module.exports = CartRepository;
