const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// All cart routes require a logged-in user; guests keep their cart in
// localStorage on the client and it's merged into the DB cart on login.

// GET /api/cart
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
    if (!cart) cart = { items: [] };
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart - add an item { productId, quantity }
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) cart = new Cart({ userId: req.userId, items: [] });

    const existing = cart.items.find((i) => i.productId.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.productId');
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/:productId - update quantity { quantity }
router.put('/:productId', requireAuth, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'quantity must be at least 1' });

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find((i) => i.productId.toString() === req.params.productId);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });

    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.productId');
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/:productId
router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.productId.toString() !== req.params.productId);
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.productId');
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
