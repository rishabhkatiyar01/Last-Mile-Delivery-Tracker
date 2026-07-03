const Order = require('../models/Order');
const StatusHistory = require('../models/StatusHistory');
const User = require('../models/User');
const { calculateCharge } = require('../services/rateCalculator.service');
const { autoAssignAgent } = require('../services/autoAssign.service');
const { canTransition } = require('../services/statusMachine.service');
const { notify } = require('../services/notification.service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.quoteOrder = asyncHandler(async (req, res, next) => {
  const chargeDetails = await calculateCharge(req.body);
  res.status(200).json({ success: true, data: chargeDetails });
});

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { pickupAddress, dropAddress, dimensions, actualWeight, orderType, paymentType, customerId } = req.body;

  // Set customer
  let customer = req.user._id;
  let createdByAdmin = false;
  
  if (req.user.role === 'admin' && customerId) {
    customer = customerId;
    createdByAdmin = true;
  }

  const chargeDetails = await calculateCharge({
    pickupPincode: pickupAddress.pincode,
    dropPincode: dropAddress.pincode,
    dimensions,
    actualWeight,
    orderType,
    paymentType,
  });

  const order = await Order.create({
    customer,
    createdByAdmin,
    pickupAddress,
    dropAddress,
    dimensions,
    actualWeight,
    volumetricWeight: chargeDetails.volumetricWeight,
    billedWeight: chargeDetails.billedWeight,
    orderType,
    paymentType,
    pickupZone: chargeDetails.pickupZone._id,
    dropZone: chargeDetails.dropZone._id,
    zoneRelation: chargeDetails.zoneRelation,
    charge: chargeDetails.charge,
    currentStatus: 'CREATED',
  });

  await StatusHistory.create({
    order: order._id,
    status: 'CREATED',
    changedBy: { userId: req.user._id, role: req.user.role },
  });

  res.status(201).json({ success: true, data: order });
});

exports.getOrders = asyncHandler(async (req, res, next) => {
  let query = {};
  
  if (req.user.role === 'customer') {
    query.customer = req.user._id;
  } else if (req.user.role === 'agent') {
    query.assignedAgent = req.user._id;
  } else if (req.user.role === 'admin') {
    const { status, zone, agent } = req.query;
    if (status) query.currentStatus = status;
    if (zone) query.$or = [{ pickupZone: zone }, { dropZone: zone }];
    if (agent) query.assignedAgent = agent;
  }

  const orders = await Order.find(query)
    .populate('customer', 'name email phone')
    .populate('assignedAgent', 'name phone');

  res.status(200).json({ success: true, data: orders });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('assignedAgent', 'name phone')
    .populate('pickupZone', 'name')
    .populate('dropZone', 'name');

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  // Check ownership for customer/agent
  if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'Not authorized'));
  }
  if (req.user.role === 'agent' && order.assignedAgent && order.assignedAgent._id.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'Not authorized'));
  }

  res.status(200).json({ success: true, data: order });
});

exports.getTracking = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  // Auth checks
  if (req.user.role === 'customer' && order.customer.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'Not authorized'));
  }

  const history = await StatusHistory.find({ order: req.params.id }).sort('timestamp');
  res.status(200).json({ success: true, data: history });
});

// Admin triggers auto-assign
exports.triggerAutoAssign = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  if (order.currentStatus !== 'CREATED' && order.currentStatus !== 'RESCHEDULED') {
    return next(new ApiError(400, 'Order is not in a state to be assigned'));
  }

  const updatedOrder = await autoAssignAgent(order);
  res.status(200).json({ success: true, data: updatedOrder });
});

// Admin manual assign
exports.manualAssign = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError(404, 'Order not found'));

  const agent = await User.findOne({ _id: req.body.agentId, role: 'agent' });
  if (!agent) return next(new ApiError(404, 'Agent not found'));

  order.assignedAgent = agent._id;
  order.currentStatus = 'ASSIGNED';
  await order.save();

  await StatusHistory.create({
    order: order._id,
    status: 'ASSIGNED',
    changedBy: { userId: req.user._id, role: 'admin' },
    note: 'Manual assignment by admin',
  });

  await notify(order, 'ASSIGNED');

  res.status(200).json({ success: true, data: order });
});

// Agent updates status
exports.updateStatus = asyncHandler(async (req, res, next) => {
  const { status, failureReason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ApiError(404, 'Order not found'));

  // Allow admins or the assigned agent
  if (req.user.role === 'agent' && (!order.assignedAgent || order.assignedAgent.toString() !== req.user._id.toString())) {
    return next(new ApiError(403, 'Not authorized for this order'));
  }

  if (!canTransition(order.currentStatus, status)) {
    return next(new ApiError(400, `Cannot transition from ${order.currentStatus} to ${status}`));
  }

  order.currentStatus = status;
  if (status === 'FAILED') {
    order.failureReason = failureReason;
  }
  
  if (status === 'DELIVERED' || status === 'FAILED') {
    // Decrease agent's active order count if they have one assigned
    if (order.assignedAgent) {
      const agent = await User.findById(order.assignedAgent);
      if (agent) {
         agent.activeOrderCount = Math.max(0, agent.activeOrderCount - 1);
         if (agent.activeOrderCount < 5 && agent.availabilityStatus === 'busy') {
            agent.availabilityStatus = 'available';
         }
         await agent.save();
      }
    }
  }

  await order.save();

  await StatusHistory.create({
    order: order._id,
    status,
    changedBy: { userId: req.user._id, role: req.user.role },
  });

  await notify(order, status);

  res.status(200).json({ success: true, data: order });
});

// Admin overrides status
exports.overrideStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ApiError(404, 'Order not found'));

  order.currentStatus = status;
  await order.save();

  await StatusHistory.create({
    order: order._id,
    status,
    changedBy: { userId: req.user._id, role: 'admin' },
    note: note || 'admin override',
  });

  await notify(order, status);

  res.status(200).json({ success: true, data: order });
});

// Customer reschedules
exports.reschedule = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError(404, 'Order not found'));

  if (order.customer.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'Not authorized'));
  }

  if (order.currentStatus !== 'FAILED') {
    return next(new ApiError(400, 'Only failed orders can be rescheduled'));
  }

  order.rescheduledDate = req.body.rescheduledDate;
  order.currentStatus = 'RESCHEDULED';
  await order.save();

  await StatusHistory.create({
    order: order._id,
    status: 'RESCHEDULED',
    changedBy: { userId: req.user._id, role: 'customer' },
  });
  
  await notify(order, 'RESCHEDULED');

  // Automatically attempt to reassign
  try {
    await autoAssignAgent(order);
  } catch (error) {
    console.log(`Auto-assign failed after reschedule for order ${order._id}:`, error.message);
  }

  res.status(200).json({ success: true, data: order });
});
