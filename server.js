const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/provider');
const tenantRoutes = require('./routes/tenant');
const connectionRoutes = require('./routes/connection');
const subscriptionRoutes = require('./routes/subscription');
const kycRoutes = require('./routes/kyc');
const reviewRoutes = require('./routes/review');
const notificationRoutes = require('./routes/notification');
const premiumRoutes = require('./routes/premium');
const adminRoutes = require('./routes/admin');

// OLD ROUTES - Commented for future B2B features
// const vendorRoutes = require('./routes/vendor');
// const menuRoutes = require('./routes/menu');
// const cartRoutes = require('./routes/cart');
// const orderRoutes = require('./routes/order');
// const userRoutes = require('./routes/user');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://aniketiffin.com',
    ],
    credentials: true,
};
app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiter to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/admin/login', authLimiter);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AnikeTiffin Backend API is running',
        version: '1.0.0',
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

// API Routes - P2P Model
app.use('/api/auth', authRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/connection', connectionRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/admin', adminRoutes);

// OLD ROUTES - Commented for future B2B features
// app.use('/api/vendors', vendorRoutes);
// app.use('/api/vendors/menu', menuRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/users', userRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║      🍱 AnikeTiffin Backend Server Running 🍱     ║
║                                                   ║
║      Environment: ${process.env.NODE_ENV || 'development'}                      ║
║      Port: ${PORT}                                   ║
║      http://localhost:${PORT}                       ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down server due to unhandled promise rejection');
    server.close(() => process.exit(1));
});

module.exports = app;

