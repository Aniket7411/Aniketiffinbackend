# Razorpay Setup Guide

## Current Status

✅ **The app now works WITHOUT Razorpay credentials!**

- The server will start successfully even without Razorpay
- COD (Cash on Delivery) orders work perfectly
- Online payment orders will show a helpful error message

## When Starting the Server

You'll see one of these messages:

### Without Razorpay:
```
⚠️  Razorpay credentials not configured - Online payments will not work
```

### With Razorpay:
```
✅ Razorpay initialized successfully
```

## What Works Now

✅ All API endpoints work
✅ User registration and login
✅ Vendor management
✅ Menu management
✅ Cart operations
✅ **COD (Cash on Delivery) orders** - Fully functional!
✅ Order tracking
✅ Reviews and ratings
✅ Admin dashboard

❌ Online payment orders - Requires Razorpay credentials

## How to Get Razorpay Credentials (When Ready)

### 1. Sign Up for Razorpay
Visit: https://razorpay.com/

### 2. Create Account
- Sign up for a free account
- Complete KYC (if required)
- Go to Test/Live mode

### 3. Get API Keys

**For Testing (Test Mode):**
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate Test Key
4. Copy `Key ID` and `Key Secret`

**For Production (Live Mode):**
1. Switch to Live mode
2. Complete all verification requirements
3. Generate Live Key
4. Copy `Key ID` and `Key Secret`

### 4. Update .env File

```env
# For Testing
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx

# For Production
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx
```

### 5. Restart Server

```bash
npm run dev
```

You should see:
```
✅ Razorpay initialized successfully
```

## Testing Online Payments

### Test Mode Credentials (Razorpay provides these)

**Test Cards:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI:**
- UPI ID: `success@razorpay`

**Test Netbanking:**
- Select any bank
- Use credentials provided by Razorpay

## API Usage

### Create Order with COD (Works Now!)

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "VENDOR_ID",
    "items": [{"menuItemId": "ITEM_ID", "quantity": 2}],
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "paymentMethod": "cod"
  }'
```

### Create Order with Online Payment (Requires Razorpay)

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "VENDOR_ID",
    "items": [{"menuItemId": "ITEM_ID", "quantity": 2}],
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "paymentMethod": "online"
  }'
```

## Error Messages

### Without Razorpay Configured

If someone tries to create an online payment order:

```json
{
  "success": false,
  "message": "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file"
}
```

**Solution:** Use COD payment method or configure Razorpay.

## Important Notes

- **Test Mode:** Use test credentials for development
- **Live Mode:** Use live credentials only in production
- **Webhooks:** Configure webhooks in Razorpay dashboard for automatic payment updates
- **Security:** Never commit .env file with real credentials to Git

## Razorpay Pricing

- **Test Mode:** Free forever
- **Production:** Transaction fees apply (usually 2% + GST)
- Check current pricing at: https://razorpay.com/pricing/

## Support

For Razorpay issues:
- Documentation: https://razorpay.com/docs/
- Support: https://razorpay.com/support/

For Backend Issues:
- Check `GETTING_STARTED.md`
- Check `API_ENDPOINTS.md`

---

**Summary:** Your backend is fully functional! COD orders work perfectly. Add Razorpay credentials later when you're ready for online payments.

