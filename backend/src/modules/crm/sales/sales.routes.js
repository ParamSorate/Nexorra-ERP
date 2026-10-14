const express = require('express');
const router = express.Router();
const salesController = require('./sales.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

// Products
router.get('/products', authorize('sales', 'READ'), salesController.getProducts);
router.post('/products', authorize('sales', 'CREATE'), salesController.createProduct);

// Quotes
router.get('/quotes', authorize('sales', 'READ'), salesController.getQuotes);
router.post('/quotes', authorize('sales', 'CREATE'), salesController.createQuote);
router.put('/quotes/:id/status', authorize('sales', 'UPDATE'), salesController.updateQuoteStatus);

// Orders
router.get('/orders', authorize('sales', 'READ'), salesController.getOrders);
router.post('/orders', authorize('sales', 'CREATE'), salesController.createOrder);
router.put('/orders/:id/status', authorize('sales', 'UPDATE'), salesController.updateOrderStatus);

module.exports = router;
