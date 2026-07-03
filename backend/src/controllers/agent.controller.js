const User = require('../models/User');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.getAssignedOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ assignedAgent: req.user._id })
    .populate('customer', 'name phone')
    .populate('pickupZone', 'name')
    .populate('dropZone', 'name');

  res.status(200).json({ success: true, data: orders });
});

exports.updateLocation = asyncHandler(async (req, res, next) => {
  const { lat, lng } = req.body;

  const agent = await User.findById(req.user._id);
  if (!agent) return next(new ApiError(404, 'Agent not found'));

  agent.currentLocation = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  await agent.save();

  res.status(200).json({ success: true, data: agent.currentLocation });
});

exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const agent = await User.findById(req.user._id);
  if (!agent) return next(new ApiError(404, 'Agent not found'));

  // Logic: if agent has active orders and tries to go available from busy, allow it but maybe warn?
  // We'll trust the input for now.
  agent.availabilityStatus = status;
  await agent.save();

  res.status(200).json({ success: true, data: agent.availabilityStatus });
});
