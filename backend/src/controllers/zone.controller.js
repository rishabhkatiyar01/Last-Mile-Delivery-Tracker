const Zone = require('../models/Zone');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createZone = asyncHandler(async (req, res, next) => {
  const { name, pincodes } = req.body;
  
  const zone = await Zone.create({
    name,
    pincodes,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: zone });
});

exports.getZones = asyncHandler(async (req, res, next) => {
  const zones = await Zone.find();
  res.status(200).json({ success: true, data: zones });
});

exports.updateZone = asyncHandler(async (req, res, next) => {
  const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!zone) {
    return next(new ApiError(404, 'Zone not found'));
  }

  res.status(200).json({ success: true, data: zone });
});

exports.deleteZone = asyncHandler(async (req, res, next) => {
  const zone = await Zone.findByIdAndDelete(req.params.id);

  if (!zone) {
    return next(new ApiError(404, 'Zone not found'));
  }

  res.status(200).json({ success: true, data: {} });
});

exports.updatePincodes = asyncHandler(async (req, res, next) => {
  const { pincodes } = req.body;
  const zone = await Zone.findById(req.params.id);

  if (!zone) {
    return next(new ApiError(404, 'Zone not found'));
  }

  zone.pincodes = pincodes;
  await zone.save();

  res.status(200).json({ success: true, data: zone });
});
