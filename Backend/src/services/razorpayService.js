const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (amount, currency = 'INR') => {
  const options = {
    amount: amount * 100, // amount in paise
    currency,
    receipt: `receipt_${Date.now()}`,
  };
  
  return await razorpay.orders.create(options);
};

const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  
  return expectedSignature === razorpaySignature;
};

module.exports = { createOrder, verifyPayment };