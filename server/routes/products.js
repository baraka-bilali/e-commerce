const express = require('express');
const products = require('../data/products');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  res.json(products);
});

router.get('/:id', authMiddleware, (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id, 10));
  if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
  res.json(product);
});

module.exports = router;
