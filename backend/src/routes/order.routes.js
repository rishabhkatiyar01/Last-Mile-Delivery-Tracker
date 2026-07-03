const express = require('express');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const orderSchema = require('../validators/order.schema');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.use(auth);

// Publicly available (authenticated)
router.post('/quote', validate(orderSchema.getQuote), orderController.quoteOrder);
router.post('/', validate(orderSchema.createOrder), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.get('/:id/tracking', orderController.getTracking);
router.post('/:id/reschedule', authorize('customer'), validate(orderSchema.reschedule), orderController.reschedule);

// Admin / Agent status update
router.patch('/:id/status', authorize('agent', 'admin'), validate(orderSchema.updateStatus), orderController.updateStatus);

// Admin only overrides
router.patch('/:id/assign', authorize('admin'), validate(orderSchema.assignAgent), orderController.manualAssign);
router.post('/:id/auto-assign', authorize('admin'), orderController.triggerAutoAssign);
router.patch('/:id/override-status', authorize('admin'), validate(orderSchema.overrideStatus), orderController.overrideStatus);

module.exports = router;
