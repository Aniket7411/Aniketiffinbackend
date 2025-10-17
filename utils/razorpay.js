const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance only if credentials are provided
let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key' &&
  process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_secret') {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized successfully');
} else {
  console.log('⚠️  Razorpay credentials not configured - Online payments will not work');
}

// Create Razorpay order
const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file');
  }

  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt,
    };
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

// Verify Razorpay signature
const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay is not configured');
  }

  try {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    return false;
  }
};

module.exports = {
  razorpayInstance,
  createRazorpayOrder,
  verifyRazorpaySignature,
};

