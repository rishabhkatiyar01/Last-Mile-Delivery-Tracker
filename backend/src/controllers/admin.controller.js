const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createAgent = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, zone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ApiError(400, 'User already exists'));
  }

  const agent = await User.create({
    name,
    email,
    password,
    phone,
    role: 'agent',
    zone,
  });

  res.status(201).json({
    success: true,
    data: {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      role: agent.role,
      zone: agent.zone,
    },
  });
});

exports.getAgents = asyncHandler(async (req, res, next) => {
  const agents = await User.find({ role: 'agent' }).select('-password').populate('zone', 'name');
  res.status(200).json({ success: true, data: agents });
});

exports.updateAgentStatus = asyncHandler(async (req, res, next) => {
  const { availabilityStatus } = req.body;

  const agent = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'agent' },
    { availabilityStatus },
    { new: true, runValidators: true }
  ).select('-password');

  if (!agent) {
    return next(new ApiError(404, 'Agent not found'));
  }

  res.status(200).json({ success: true, data: agent });
});
