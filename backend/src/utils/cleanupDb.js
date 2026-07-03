const mongoose = require('mongoose');
const User = require('../models/User');
const Zone = require('../models/Zone');
const RateCard = require('../models/RateCard');
const Order = require('../models/Order');
const StatusHistory = require('../models/StatusHistory');
const connectDB = require('../config/db');

const cleanupAndSeed = async () => {
  try {
    await connectDB();

    console.log('Cleaning up database collections...');
    await Promise.all([
      User.deleteMany({}),
      Zone.deleteMany({}),
      RateCard.deleteMany({}),
      Order.deleteMany({}),
      StatusHistory.deleteMany({}),
    ]);
    console.log('Database cleaned up successfully!');

    // Seed Admin User
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@delivery.com',
      password: 'AdminPassword123',
      role: 'admin',
      availabilityStatus: 'offline',
    });

    console.log('Admin user seeded:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup and seeding:', error);
    process.exit(1);
  }
};

cleanupAndSeed();
