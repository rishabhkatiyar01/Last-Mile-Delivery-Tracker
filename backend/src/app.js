const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const orderRoutes = require('./routes/order.routes');
const agentRoutes = require('./routes/agent.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
});
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/agent', agentRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
