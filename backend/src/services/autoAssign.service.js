const User = require('../models/User');
const StatusHistory = require('../models/StatusHistory');
const ApiError = require('../utils/ApiError');
const { notify } = require('./notification.service');

const MAX_CONCURRENT_ORDERS = 5;

async function autoAssignAgent(order) {
  // Prefer agents physically near pickup point; fallback to zone match
  let agent = await User.findOne({
    role: 'agent',
    availabilityStatus: 'available',
    zone: order.pickupZone,
    activeOrderCount: { $lt: MAX_CONCURRENT_ORDERS },
    currentLocation: {
      $near: {
        $geometry: { type: 'Point', coordinates: order.pickupAddress.coordinates },
        $maxDistance: 15000, // 15km
      },
    },
  }).sort({ activeOrderCount: 1 }); // least busy first

  if (!agent) {
    // fallback: any available agent in the zone, ignore geo
    agent = await User.findOne({
      role: 'agent',
      availabilityStatus: 'available',
      zone: order.pickupZone,
      activeOrderCount: { $lt: MAX_CONCURRENT_ORDERS },
    }).sort({ activeOrderCount: 1 });
  }

  if (!agent) {
    throw new ApiError(409, 'No available agent found for this zone');
  }

  order.assignedAgent = agent._id;
  order.currentStatus = 'ASSIGNED';
  order.reassignmentCount += 1;
  
  agent.activeOrderCount += 1;
  if (agent.activeOrderCount >= MAX_CONCURRENT_ORDERS) {
    agent.availabilityStatus = 'busy';
  }

  await Promise.all([order.save(), agent.save()]);

  // Log status history
  await StatusHistory.create({
    order: order._id,
    status: 'ASSIGNED',
    changedBy: { role: 'system' }, // system triggered assignment
    note: 'Auto-assigned by system',
  });

  await notify(order, 'ASSIGNED');
  return order;
}

module.exports = {
  autoAssignAgent,
};
