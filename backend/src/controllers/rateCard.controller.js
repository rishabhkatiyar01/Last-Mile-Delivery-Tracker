const RateCard = require('../models/RateCard');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createRateCard = asyncHandler(async (req, res, next) => {
  try {
    const rateCard = await RateCard.create(req.body);
    res.status(201).json({ success: true, data: rateCard });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Active rate card for this combination already exists'));
    }
    return next(error);
  }
});

exports.getRateCards = asyncHandler(async (req, res, next) => {
  const rateCards = await RateCard.find();
  res.status(200).json({ success: true, data: rateCards });
});

exports.updateRateCard = asyncHandler(async (req, res, next) => {
  try {
    const rateCard = await RateCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!rateCard) {
      return next(new ApiError(404, 'Rate card not found'));
    }

    res.status(200).json({ success: true, data: rateCard });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Active rate card for this combination already exists'));
    }
    return next(error);
  }
});

exports.deleteRateCard = asyncHandler(async (req, res, next) => {
  const rateCard = await RateCard.findByIdAndDelete(req.params.id);

  if (!rateCard) {
    return next(new ApiError(404, 'Rate card not found'));
  }

  res.status(200).json({ success: true, data: {} });
});
