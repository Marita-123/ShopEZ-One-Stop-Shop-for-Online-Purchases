const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); // Make sure you have a Cart model
const Order = require('../models/Order'); // Make sure you have an Order model

// Add to Cart
router.post('/add', async (req, res) => {
  const { productId, userId } = req.body;
  const item = new Cart({ productId, userId });
  await item.save();
  res.json({ message: 'Added to cart' });
});

// Buy
router.post('/buy', async (req, res) => {
  const { userId, address, paymentMode, products } = req.body;
  const order = new Order({ userId, address, paymentMode, products });
  await order.save();
  res.json({ message: 'Order placed' });
});

module.exports = router;