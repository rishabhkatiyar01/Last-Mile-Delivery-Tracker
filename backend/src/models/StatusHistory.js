const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    status: { type: String, required: true },
    changedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String },
    },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false } // Only timestamp field is needed
);

const StatusHistory = mongoose.model('StatusHistory', statusHistorySchema);
module.exports = StatusHistory;
