const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['customer', 'agent', 'admin'],
      default: 'customer',
    },
    address: { type: String },

    // Agent-only fields
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    currentLocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline',
    },
    activeOrderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ currentLocation: '2dsphere' });

// Check password method
userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Pre-save hook to hash password
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
