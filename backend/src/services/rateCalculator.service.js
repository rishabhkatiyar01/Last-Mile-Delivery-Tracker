const Zone = require('../models/Zone');
const RateCard = require('../models/RateCard');
const ApiError = require('../utils/ApiError');

/**
 * Pure function, fully data-driven — no hardcoded rates/zones.
 */
async function calculateCharge({ dimensions, actualWeight, pickupPincode, dropPincode, orderType, paymentType }) {
  // 1. Zone detection
  const pickupZone = await Zone.findOne({ pincodes: pickupPincode });
  const dropZone = await Zone.findOne({ pincodes: dropPincode });
  if (!pickupZone || !dropZone) {
    throw new ApiError(400, 'Pincode not mapped to any zone');
  }

  // 2. Volumetric weight
  const volumetricWeight = (dimensions.l * dimensions.b * dimensions.h) / 5000;
  const billedWeight = Math.max(actualWeight, volumetricWeight);

  // 3. Zone relation
  const zoneRelation = pickupZone._id.equals(dropZone._id) ? 'intra' : 'inter';

  // 4. Rate card lookup (specific zone pair)
  let rateCard = await RateCard.findOne({
    orderType,
    fromZone: pickupZone._id,
    toZone: dropZone._id,
    isActive: true,
  });

  // Fallback to default/fallback rate card if not found
  if (!rateCard) {
    rateCard = await RateCard.findOne({
      orderType,
      isDefaultFallback: true,
      isActive: true,
    });
  }

  if (!rateCard) {
    throw new ApiError(400, `No active rate card configured for route from ${pickupZone.name} to ${dropZone.name} for ${orderType}`);
  }

  // 5. Charge computation
  const baseCharge = rateCard.baseRate;
  const weightCharge = billedWeight * rateCard.perKgRate;
  
  let codSurcharge = 0;
  if (paymentType === 'COD') {
    if (rateCard.codSurchargeFlat) {
      codSurcharge = rateCard.codSurchargeFlat;
    } else if (rateCard.codSurchargePercent) {
      codSurcharge = (rateCard.codSurchargePercent / 100) * (baseCharge + weightCharge);
    }
  }
  
  const totalCharge = baseCharge + weightCharge + codSurcharge;

  return {
    pickupZone,
    dropZone,
    zoneRelation,
    volumetricWeight,
    billedWeight,
    charge: { baseCharge, weightCharge, codSurcharge, totalCharge },
  };
}

module.exports = {
  calculateCharge,
};
