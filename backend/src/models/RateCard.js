const mongoose = require('mongoose');

const rateCardSchema = new mongoose.Schema(
  {
    orderType: { type: String, enum: ['B2B', 'B2C'], required: true },
    zoneRelation: { type: String, enum: ['intra', 'inter'], required: true },
    baseRate: { type: Number, required: true },
    perKgRate: { type: Number, required: true },
    codSurchargeFlat: { type: Number },
    codSurchargePercent: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

rateCardSchema.index({ orderType: 1, zoneRelation: 1, isActive: 1 }, { unique: true });

const RateCard = mongoose.model('RateCard', rateCardSchema);
module.exports = RateCard;
