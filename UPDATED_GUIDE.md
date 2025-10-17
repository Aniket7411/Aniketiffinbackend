# ✅ AnikeTiffin Backend - UPDATED TO P2P MODEL

## 🎉 What's Been Done

I've completely updated the backend to match your **peer-to-peer home tiffin subscription** business model!

---

## 📋 Summary of Changes

### ✅ NEW Models Created
1. **Provider Model** - Home cooks with menu, pricing, location, capacity
2. **Tenant Model** - Students with food preferences, budget, location
3. **Subscription Model** - Daily/weekly/monthly meal subscriptions
4. **ConnectionRequest Model** - Interest/connection between tenant & provider
5. **Updated Review Model** - P2P reviews for both parties
6. **Updated User Model** - Roles changed to: `tenant`, `provider`, `admin`

### ✅ NEW Controllers & Routes
1. **Provider Controller** - Registration, profile, discovery
2. **Tenant Controller** - Registration, profile management
3. **Connection Controller** - Send requests, accept/reject
4. **Subscription Controller** - Create, manage subscriptions
5. **KYC Controller** - Document upload, verification

### ✅ Key Features Implemented

#### 1. **Registration**
- Providers register with cuisine types, price range, capacity
- Tenants register with food preferences, budget, requirements
- No complex business licenses needed!

#### 2. **Location-Based Discovery**
- Search providers by area/city
- Filter by cuisine, food type, price
- Find providers with available capacity

#### 3. **KYC Verification**
- Both parties upload Aadhar, photo, address proof
- Admin verifies before allowing connections
- Secure verification process

#### 4. **Connection Flow**
- Tenant browses providers in their area
- Sends connection request
- Provider accepts/rejects
- Only then can create subscription

#### 5. **Subscription Management**
- Choose daily/weekly/monthly plans
- Select meals (breakfast/lunch/dinner)
- Set pricing per meal
- Pause/resume subscriptions
- Track payment status

#### 6. **Reviews**
- Both parties can review each other
- Rate on multiple aspects (food quality, hygiene, punctuality, behavior)
- Builds trust in the community

---

## 📁 What Was Kept for Later

I've **commented out** (not deleted) these files for future B2B features:
- Old Vendor model (with FSSAI license) - `models/Vendor.js`
- Old vendor routes - commented in `server.js`
- Old menu, cart, order routes - ready to uncomment when needed

---

## 📚 Documentation Created

### 1. **P2P_API_SPECIFICATION.md** ⭐
**This is what you need for frontend development!**

Complete API documentation including:
- All endpoints with request/response examples
- Data models and schemas
- Authentication flow
- Complete user journeys
- Frontend development guide

### 2. Updated Files
- `README.md` - Updated with P2P model info
- `GETTING_STARTED.md` - Already has setup instructions
- `RAZORPAY_SETUP.md` - Payment gateway setup (optional)

---

## 🚀 How to Start

### 1. Install & Setup
```bash
npm install
npm run seed:admin
npm run dev
```

Server starts at `http://localhost:5000`

### 2. Test the API

#### Register a Provider:
```bash
curl -X POST http://localhost:5000/api/provider/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "9876543210",
    "password": "password123",
    "displayName": "Priyas Home Kitchen",
    "location": {
      "address": "123 ABC Apartments",
      "area": "Koramangala",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560034"
    },
    "cuisineTypes": ["North Indian"],
    "foodType": "veg",
    "priceRange": { "min": 80, "max": 150 },
    "maxTenants": 5
  }'
```

#### Register a Tenant:
```bash
curl -X POST http://localhost:5000/api/tenant/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Kumar",
    "email": "rahul@example.com",
    "phone": "9876543211",
    "password": "password123",
    "accommodationType": "pg",
    "location": {
      "address": "XYZ PG",
      "area": "Koramangala",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560034"
    },
    "foodPreferences": {
      "type": "veg",
      "cuisinePreferences": ["North Indian"],
      "tastePreference": "medium"
    },
    "mealsRequired": {
      "lunch": { "required": true, "preferredTime": "1:00 PM" },
      "dinner": { "required": true, "preferredTime": "8:00 PM" }
    },
    "budgetRange": { "min": 80, "max": 120, "perMeal": true }
  }'
```

---

## 🔄 Complete User Flow

### For Providers (Home Cooks):
1. Register → Profile created
2. Upload KYC documents
3. Wait for admin verification
4. Add menu items and pricing
5. Receive connection requests from tenants
6. Accept/reject requests
7. Manage subscriptions
8. Receive reviews

### For Tenants (Students):
1. Register → Profile created
2. Upload KYC documents
3. Wait for admin verification
4. Browse providers in area
5. Send connection request
6. Provider accepts
7. Create subscription (choose meals, duration)
8. Manage subscription (pause/cancel)
9. Leave reviews

### For Admin:
1. Verify KYC documents
2. Monitor subscriptions
3. View dashboard stats
4. Handle disputes

---

## 🎯 API Endpoints Summary

### Auth & Registration
- `POST /api/provider/register` - Register as provider
- `POST /api/tenant/register` - Register as tenant
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Provider
- `GET /api/provider/search` - Browse providers (location-based)
- `GET /api/provider/:id` - Provider details
- `GET /api/provider/profile/me` - My profile
- `PUT /api/provider/profile/me` - Update profile

### Tenant
- `GET /api/tenant/profile/me` - My profile
- `PUT /api/tenant/profile/me` - Update profile

### Connection
- `POST /api/connection/request` - Send connection request
- `PUT /api/connection/respond/:id` - Accept/reject request
- `GET /api/connection/my-requests` - View requests

### Subscription
- `POST /api/subscription/create` - Create subscription
- `GET /api/subscription/my-subscriptions` - My subscriptions
- `PUT /api/subscription/:id/status` - Update status
- `PUT /api/subscription/:id/pause` - Pause subscription

### KYC
- `POST /api/kyc/upload` - Upload documents
- `GET /api/kyc/status` - Check status
- `PUT /api/kyc/verify/:id` - Verify (admin)
- `GET /api/kyc/pending` - Pending verifications (admin)

### Reviews
- `POST /api/reviews` - Add review
- `GET /api/reviews/my-reviews` - My reviews

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- All KYC verification endpoints

---

## 📱 Frontend Development Guide

### Start Here:
1. **Read `P2P_API_SPECIFICATION.md`** - Complete API reference
2. Build registration pages (Provider & Tenant)
3. Implement location-based search
4. Create connection request flow
5. Build subscription management
6. Add KYC document upload (use Cloudinary or AWS S3)
7. Implement review system

### Key UI Components Needed:
- Registration forms (Provider & Tenant)
- Provider search/browse page with filters
- Provider profile cards
- Connection request modal
- Subscription creation form
- Dashboard (for both Provider & Tenant)
- KYC document upload
- Review/rating component

---

## 🔧 TODO for Production

### Immediate:
- [ ] Implement file upload for KYC (multer + Cloudinary/S3)
- [ ] Add geospatial queries for location-based search
- [ ] Implement subscription expiry cron job
- [ ] Add notification system
- [ ] Implement chat/messaging between connected parties

### Later:
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Mobile app API optimization
- [ ] Analytics dashboard
- [ ] Referral system

---

## 💡 Business Logic Implemented

1. **Capacity Management** - Providers can set max tenants
2. **KYC Gating** - Must verify before connecting
3. **Connection Approval** - Provider must accept tenant
4. **Subscription Flexibility** - Choose meals, duration, pricing
5. **Pause Feature** - Temporary subscription pause (holidays)
6. **Review System** - Builds trust and quality
7. **Location-Based** - Find nearby providers only

---

## 🎊 You're Ready to Build Frontend!

Everything you need is in:
📖 **`P2P_API_SPECIFICATION.md`**

This document has:
- Every endpoint
- Request/response examples
- Data models
- Complete user flows
- Frontend development tips

Start building and let me know if you need any clarifications! 🚀


