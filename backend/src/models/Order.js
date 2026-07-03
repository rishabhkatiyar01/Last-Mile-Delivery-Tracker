const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdByAdmin: { type: Boolean, default: false },

    pickupAddress: {
      line: String,
      pincode: String,
      lat: Number,
      lng: Number,
      coordinates: { type: [Number] }, // [lng, lat] for geo queries
    },
    dropAddress: {
      line: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },

    dimensions: {
      l: { type: Number, required: true },
      b: { type: Number, required: true },
      h: { type: Number, required: true },
    },
    actualWeight: { type: Number, required: true },
    volumetricWeight: { type: Number },
    billedWeight: { type: Number },

    orderType: { type: String, enum: ['B2B', 'B2C'], required: true },
    paymentType: { type: String, enum: ['Prepaid', 'COD'], required: true },

    pickupZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    dropZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    zoneRelation: { type: String, enum: ['intra', 'inter'] },

    charge: {
      baseCharge: Number,
      weightCharge: Number,
      codSurcharge: Number,
      totalCharge: Number,
    },

    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    currentStatus: {
      type: String,
      enum: [
        'CREATED',
        'ASSIGNED',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'FAILED',
        'RESCHEDULED',
      ],
      default: 'CREATED',
    },

    failureReason: { type: String },
    rescheduledDate: { type: Date },
    reassignmentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Pre-save hook to generate order number
orderSchema.pre('save', function () {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  // Ensure coordinates array is populated if lat/lng are provided
  if (this.pickupAddress && this.pickupAddress.lat && this.pickupAddress.lng && (!this.pickupAddress.coordinates || this.pickupAddress.coordinates.length === 0)) {
     this.pickupAddress.coordinates = [this.pickupAddress.lng, this.pickupAddress.lat];
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
