const RateCard = require('../models/RateCard');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createRateCard = asyncHandler(async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.fromZone || body.fromZone === '') body.fromZone = null;
    if (!body.toZone || body.toZone === '') body.toZone = null;
    
    // Validate that if fallback is false, both fromZone and toZone are provided
    if (!body.isDefaultFallback && (!body.fromZone || !body.toZone)) {
      return next(new ApiError(400, 'fromZone and toZone are required when not a fallback rate card'));
    }
    // If it is fallback, enforce fromZone and toZone are null
    if (body.isDefaultFallback) {
      body.fromZone = null;
      body.toZone = null;
    }

    const rateCard = await RateCard.create(body);
    res.status(201).json({ success: true, data: rateCard });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Rate card for this combination already exists'));
    }
    return next(error);
  }
});

exports.getRateCards = asyncHandler(async (req, res, next) => {
  const { matrix, orderType } = req.query;

  if (matrix === 'true') {
    const Zone = require('../models/Zone');
    const zones = await Zone.find().select('name');
    const rateCards = await RateCard.find({ orderType: orderType || 'B2C' });

    // Build a matrix of zone pairs and whether they have a configured rate card
    const pairs = [];
    for (const from of zones) {
      for (const to of zones) {
        const card = rateCards.find(
          (rc) =>
            rc.fromZone &&
            rc.fromZone.toString() === from._id.toString() &&
            rc.toZone &&
            rc.toZone.toString() === to._id.toString()
        );
        pairs.push({
          fromZone: from,
          toZone: to,
          hasRateCard: !!card,
          rateCardId: card ? card._id : null,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        zones,
        pairs,
      },
    });
  }

  const rateCards = await RateCard.find()
    .populate('fromZone', 'name')
    .populate('toZone', 'name');
  res.status(200).json({ success: true, data: rateCards });
});

exports.updateRateCard = asyncHandler(async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.fromZone === '') body.fromZone = null;
    if (body.toZone === '') body.toZone = null;

    if (body.isDefaultFallback) {
      body.fromZone = null;
      body.toZone = null;
    }

    const rateCard = await RateCard.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!rateCard) {
      return next(new ApiError(404, 'Rate card not found'));
    }

    res.status(200).json({ success: true, data: rateCard });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Rate card for this combination already exists'));
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
