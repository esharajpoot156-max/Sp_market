import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

// Buyer creates an order
export const createOrder = async (req, res, next) => {
  try {
    const { productId, quantity, city, details, notes } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Please provide a product" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot buy your own product" });
    }

    if (product.isSold) {
      return res.status(400).json({ message: "This product is already sold" });
    }

    const order = await Order.create({
      productId,
      buyerId: req.user._id,
      sellerId: product.sellerId,
      quantity: quantity || 1,
      price: product.price,
      deliveryAddress: { city, details },
      notes,
    });

    await Notification.create({
      userId: product.sellerId,
      type: "booking",
      message: `New order request for "${product.title}"`,
    });

    const populatedOrder = await order.populate([
      { path: "productId", select: "title images price" },
      { path: "buyerId", select: "name profilePicture" },
    ]);

    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

// Buyer's own orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate("productId", "title images price")
      .populate("sellerId", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// Seller's received orders
export const getReceivedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ sellerId: req.user._id })
      .populate("productId", "title images price")
      .populate("buyerId", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// Seller updates order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    const allowedTransitions = {
      pending: ["confirmed", "rejected"],
      confirmed: ["shipped"],
      shipped: ["delivered"],
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    // Mark product as sold once delivered
    if (status === "delivered") {
      await Product.findByIdAndUpdate(order.productId, { isSold: true });
    }

    await Notification.create({
      userId: order.buyerId,
      type: "booking",
      message: `Your order is now ${status}`,
    });

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// Cancel order (buyer or seller, only if pending/confirmed)
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isParty =
      order.buyerId.toString() === req.user._id.toString() ||
      order.sellerId.toString() === req.user._id.toString();

    if (!isParty) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({ message: "This order cannot be cancelled" });
    }

    order.status = "cancelled";
    order.cancelledBy = req.user._id;
    order.cancelReason = reason || "";
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};