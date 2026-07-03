const express = require('express');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const agentSchema = require('../validators/agent.schema');
const agentController = require('../controllers/agent.controller');

const router = express.Router();

router.use(auth, authorize('agent'));

router.get('/orders', agentController.getAssignedOrders);
router.patch('/location', validate(agentSchema.updateLocation), agentController.updateLocation);
router.patch('/availability', validate(agentSchema.updateAvailability), agentController.updateAvailability);

module.exports = router;
