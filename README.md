# AnikeTiffin Backend API - P2P Tiffin Platform

**Peer-to-peer platform** connecting home cooks with students/PG residents for home-cooked tiffin services.

## 🎯 Platform Features

### Core Features ✅
- **Minimal Registration** - Only 4 fields needed
- **Premium System** - Contact visibility & benefits
- **Notification System** - Real-time updates
- **Sample Food** - Try before subscribing
- **KYC Verification** - Secure connections
- **Profile Completion** - Auto-tracked progress
- **Location-based Search** - Find nearby providers

### User Roles
- **Provider** - Home cooks offering tiffin services
- **Tenant** - Students/PG residents looking for tiffins
- **Admin** - Platform management

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Payment Gateway:** Razorpay SDK
- **Utilities:** CORS, dotenv, express-validator

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   - The `.env` file is already created with working defaults
   - **Note:** Razorpay credentials are optional. COD orders work without it!
   - See `RAZORPAY_SETUP.md` for payment gateway setup (optional)

3. **Start MongoDB:**
   Make sure MongoDB is running on your system

4. **Seed Admin User:**
   ```bash
   npm run seed:admin
   ```

5. **Run the Server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 Documentation

- **📖 Main API Spec:** `COMPLETE_API_DOCUMENTATION.md` - **START HERE!**
- **⚡ Quick Start:** `QUICK_START.md` - Get running in 2 minutes
- **✅ Implementation:** `IMPLEMENTATION_COMPLETE.md` - What's built
- **📝 Simplified Registration:** `SIMPLIFIED_REGISTRATION.md`
- **💎 Razorpay Setup:** `RAZORPAY_SETUP.md` (optional for payments)

## Project Structure

```
├── config/
│   └── db.js              # Database connection
├── models/                # Mongoose models
│   ├── User.js
│   ├── Vendor.js
│   ├── MenuItem.js
│   ├── Order.js
│   ├── Cart.js
│   └── Review.js
├── routes/                # API routes
│   ├── auth.js
│   ├── vendor.js
│   ├── menu.js
│   ├── cart.js
│   ├── order.js
│   ├── review.js
│   └── admin.js
├── controllers/           # Route controllers
├── middleware/            # Custom middleware
│   ├── auth.js
│   ├── error.js
│   └── validation.js
├── utils/                 # Utility functions
│   └── razorpay.js
├── .env.example
├── .gitignore
├── package.json
├── server.js              # Entry point
└── README.md
```

## 🔑 Default Admin Credentials

After running `npm run seed:admin`:
- **Email:** admin@aniketiffin.com
- **Password:** admin123
- **Admin Code:** SECURE_ADMIN_CODE_123

## 🎯 API Endpoints (40+)

- **Auth:** 4 endpoints
- **Provider:** 6 endpoints
- **Tenant:** 3 endpoints  
- **Connection:** 3 endpoints
- **Subscription:** 4 endpoints
- **KYC:** 4 endpoints
- **Notifications:** 4 endpoints
- **Premium:** 2 endpoints
- **Admin:** 5 endpoints
- **Reviews:** 4 endpoints

See `COMPLETE_API_DOCUMENTATION.md` for details.

## 🚀 Features

### Premium System
- Contact visibility control
- Admin-granted premium
- Auto-expiry tracking
- Benefits tracking

### Notification System
- Auto-create on events
- Real-time unread count
- Mark as read
- Paginated listing

### Sample Food
- Providers can offer samples
- Tenants can request samples
- Approval workflow
- Available days tracking

### Profile Completion
- Auto-calculate percentage
- Missing fields list
- Guides user onboarding

### Contact Privacy
- Hidden for non-premium users
- Revealed after connection accepted
- Protected phone/email/address

## License

ISC

