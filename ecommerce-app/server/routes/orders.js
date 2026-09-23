const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

// POST /api/orders - checkout: turn the current cart into an Order
// body: { shippingAddress }
// Payment is stubbed - order is created directly as "confirmed".
// To add Stripe/Razorpay later: create a PaymentIntent/order here first,
// only call this logic from your payment webhook / success callback.
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    const cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // Verify stock and build line items in one pass
    const orderItems = [];
    let totalAmount = 0;
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) continue;
      if (product.stock < item.quantity) {
        return res.status(409).json({ error: `Not enough stock for ${product.name}` });
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
      totalAmount += product.price * item.quantity;
    }

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      userId: req.userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'confirmed'
    });

    // Clear the cart
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders - the logged-in user's order history
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id - a single order (must belong to the user)
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
