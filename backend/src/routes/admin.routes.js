const express = require('express');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const adminSchema = require('../validators/admin.schema');

const zoneController = require('../controllers/zone.controller');
const rateCardController = require('../controllers/rateCard.controller');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// All routes here require admin privileges
router.use(auth, authorize('admin'));

// --- Zones ---
router.post('/zones', validate(adminSchema.createZone), zoneController.createZone);
router.get('/zones', zoneController.getZones);
router.put('/zones/:id', zoneController.updateZone); // simplified validation
router.delete('/zones/:id', zoneController.deleteZone);
router.post('/zones/:id/pincodes', validate(adminSchema.updateZonePincodes), zoneController.updatePincodes);

// --- Rate Cards ---
router.post('/rate-cards', validate(adminSchema.createRateCard), rateCardController.createRateCard);
router.get('/rate-cards', rateCardController.getRateCards);
router.put('/rate-cards/:id', rateCardController.updateRateCard);
router.delete('/rate-cards/:id', rateCardController.deleteRateCard);

// --- Agents ---
router.post('/agents', validate(adminSchema.createAgent), adminController.createAgent);
router.get('/agents', adminController.getAgents);
router.patch('/agents/:id/status', adminController.updateAgentStatus);

// --- Customers ---
router.post('/customers', validate(adminSchema.createCustomer), adminController.createCustomer);
router.get('/customers', adminController.getCustomers);

module.exports = router;
