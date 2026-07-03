const mongoose = require('mongoose');

const rateCardSchema = new mongoose.Schema(
  {
    orderType: { type: String, enum: ['B2B', 'B2C'], required: true },
    fromZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
    toZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
    isDefaultFallback: { type: Boolean, default: false },
    baseRate: { type: Number, required: true },
    perKgRate: { type: Number, required: true },
    codSurchargeFlat: { type: Number },
    codSurchargePercent: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique index so that only one rate card can exist per orderType and zone pair (or per orderType default fallback)
rateCardSchema.index({ orderType: 1, fromZone: 1, toZone: 1 }, { unique: true });

const RateCard = mongoose.model('RateCard', rateCardSchema);
module.exports = RateCard;
