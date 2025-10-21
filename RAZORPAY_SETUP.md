# Razorpay Integration Setup

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd Backend
   npm install razorpay
   ```

2. **Environment Configuration**
   Update your `.env.local` file with Razorpay credentials:
   ```env
   RAZORPAY_KEY_ID=your_actual_key_id
   RAZORPAY_KEY_SECRET=your_actual_key_secret
   ```

3. **Get Razorpay Credentials**
   - Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Go to Settings > API Keys
   - Generate Test/Live API Keys
   - Copy Key ID and Key Secret

## Frontend Setup

1. **Environment Configuration**
   Update `Client/.env` file:
   ```env
   VITE_RAZORPAY_KEY_ID=your_actual_key_id
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

## API Endpoints

### Create Razorpay Order
```
POST /api/payments/:id/create-order
```

### Verify Payment
```
POST /api/payments/:id/verify-payment
Body: {
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
}
```

## Usage

1. **Payment Flow**:
   - Student clicks "Pay" button
   - System creates Razorpay order
   - Razorpay checkout opens
   - After payment, signature is verified
   - Fee status updated to "PAID"

2. **Security Features**:
   - Payment signature verification
   - Server-side order creation
   - Secure webhook handling

## Testing

Use Razorpay test credentials:
- Test Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

## Production Deployment

1. Replace test keys with live keys
2. Enable webhooks for payment notifications
3. Implement proper error handling
4. Add payment reconciliation