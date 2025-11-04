# Complete Backend API Documentation
## Anike Tiffin Platform

**Base URL:** `http://localhost:5000/api` (development)  
**Production URL:** `https://your-domain.com/api`

---

## Table of Contents
1. [Authentication Endpoints](#1-authentication-endpoints)
2. [Provider Endpoints](#2-provider-endpoints)
3. [Tenant Endpoints](#3-tenant-endpoints)
4. [Connection Request Endpoints](#4-connection-request-endpoints)
5. [Subscription Endpoints](#5-subscription-endpoints)
6. [Review & Rating Endpoints](#6-review--rating-endpoints)
7. [KYC Endpoints](#7-kyc-endpoints)
8. [Admin Endpoints](#8-admin-endpoints)
9. [Data Models](#9-data-models)
10. [Environment Variables](#10-environment-variables)

---

## 1. Authentication Endpoints

### 1.1 User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "tenant" | "provider",
      "name": "User Name"
    }
  }
}
```

### 1.2 User Signup/Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "tenant" | "provider"
}
```

### 1.3 Admin Login
**POST** `/auth/admin/login`

**Request Body:**
```json
{
  "email": "admin@aniketiffin.com",
  "password": "admin_password",
  "adminCode": "admin_secret_code"
}
```

### 1.4 Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "tenant",
      "name": "User Name"
    }
  }
}
```

---

## 2. Provider Endpoints

### 2.1 Register as Provider
**POST** `/provider/register`

**Request Body:**
```json
{
  "displayName": "Priya's Home Kitchen",
  "bio": "Home-style cooking with love",
  "location": {
    "address": "123 ABC Apartments",
    "area": "Koramangala",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560034"
  },
  "cuisineTypes": ["North Indian", "South Indian"],
  "foodType": "veg",
  "priceRange": {
    "min": 80,
    "max": 150
  },
  "maxTenants": 10,
  "mealsOffered": {
    "breakfast": { "available": false, "time": "" },
    "lunch": { "available": true, "time": "12:00 PM - 2:00 PM" },
    "dinner": { "available": true, "time": "7:00 PM - 9:00 PM" }
  },
  "menu": "Monday: Dal, Rice, Roti\nTuesday: Rajma, Rice..."
}
```

### 2.2 Get Provider Profile
**GET** `/provider/profile/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": {
      "_id": "provider_id",
      "displayName": "Priya's Home Kitchen",
      "bio": "Home-style cooking",
      "location": { ... },
      "cuisineTypes": [...],
      "foodType": "veg",
      "priceRange": { "min": 80, "max": 150 },
      "currentTenants": 5,
      "maxTenants": 10,
      "rating": 4.5,
      "totalReviews": 25,
      "kycStatus": "verified",
      "isActive": true,
      "isPremium": false,
      "menu": "...",
      "contactEmail": "provider@email.com",
      "contactPhone": "+919876543210",
      "tenantsInArea": 15,
      "areaStats": {
        "totalTenants": 15,
        "area": "Koramangala",
        "city": "Bangalore"
      }
    }
  }
}
```

### 2.3 Update Provider Profile
**PUT** `/provider/profile/me`

**Request Body:** (Same as register, all fields optional)

### 2.4 Search Providers
**GET** `/provider/search`

**Query Parameters:**
- `search` (string, optional): Search by name, area, or cuisine
- `area` (string, optional): Filter by area
- `city` (string, optional): Filter by city
- `cuisineType` (string, optional): Filter by cuisine
- `foodType` (string, optional): "veg" | "non-veg" | "both"
- `minPrice` (number, optional): Minimum price per meal
- `maxPrice` (number, optional): Maximum price per meal
- `minRating` (number, optional): Minimum rating (e.g., 4.0)
- `mealType` (string, optional): "breakfast" | "lunch" | "dinner"

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "_id": "provider_id",
        "displayName": "Priya's Kitchen",
        "location": { "area": "Koramangala", "city": "Bangalore" },
        "rating": 4.5,
        "totalReviews": 25,
        "priceRange": { "min": 80, "max": 150 },
        "currentTenants": 5,
        "maxTenants": 10,
        "cuisineTypes": ["North Indian"],
        "foodType": "veg",
        "mealsOffered": { ... }
      }
    ]
  }
}
```

### 2.5 Get Provider by ID
**GET** `/provider/:providerId`

**Response:** Same as Get Provider Profile

### 2.6 Get Connection Requests (Provider)
**GET** `/provider/connection-requests`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "request_id",
        "tenant": {
          "_id": "tenant_id",
          "displayName": "Aniket Sharma",
          "location": { "area": "Koramangala" },
          "foodPreferences": { "type": "veg", "tastePreference": "medium" },
          "mealsRequired": { "breakfast": false, "lunch": true, "dinner": true },
          "monthlyBudget": 5000,
          "budgetRange": { "min": 80, "max": 150, "perMeal": true }
        },
        "provider": {
          "_id": "provider_id",
          "displayName": "Priya's Kitchen"
        },
        "message": "Hi, looking for veg food...",
        "monthlyBudget": 5000,
        "status": "pending",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

## 3. Tenant Endpoints

### 3.1 Register as Tenant
**POST** `/tenant/register`

**Request Body:**
```json
{
  "displayName": "Aniket Sharma",
  "accommodationType": "pg",
  "location": {
    "address": "123 XYZ Hostel",
    "area": "Koramangala",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560034"
  },
  "foodPreferences": {
    "type": "veg",
    "cuisinePreferences": ["North Indian", "South Indian"],
    "tastePreference": "medium",
    "allergies": [],
    "avoidItems": []
  },
  "mealsRequired": {
    "breakfast": { "required": false },
    "lunch": { "required": true },
    "dinner": { "required": true }
  },
  "budgetRange": {
    "min": 80,
    "max": 150,
    "perMeal": true
  },
  "monthlyBudget": 5000
}
```

### 3.2 Get Tenant Profile
**GET** `/tenant/profile/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "_id": "tenant_id",
      "displayName": "Aniket Sharma",
      "accommodationType": "pg",
      "location": { ... },
      "foodPreferences": { ... },
      "mealsRequired": { ... },
      "budgetRange": { ... },
      "monthlyBudget": 5000,
      "kycStatus": "verified",
      "isActive": true,
      "isPremium": false
    }
  }
}
```

### 3.3 Update Tenant Profile
**PUT** `/tenant/profile/me`

**Request Body:** (Same as register, all fields optional)

---

## 4. Connection Request Endpoints

### 4.1 Send Connection Request
**POST** `/connection/request`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "providerId": "provider_id",
  "message": "Hi, I'm looking for home-style veg food...",
  "monthlyBudget": 5000
}
```

**Note:** This should notify both the provider AND admin.

### 4.2 Respond to Connection Request
**PUT** `/connection/respond/:requestId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "accepted" | "rejected",
  "message": "Happy to serve you!"
}
```

### 4.3 Get My Connection Requests (Tenant)
**GET** `/connection/my-requests`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "request_id",
        "provider": {
          "_id": "provider_id",
          "displayName": "Priya's Kitchen",
          "rating": 4.5
        },
        "status": "pending",
        "message": "...",
        "monthlyBudget": 5000,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### 4.4 Get Request Details
**GET** `/connection/request/:requestId`

**Headers:** `Authorization: Bearer <token>`

---

## 5. Subscription Endpoints

### 5.1 Create Subscription
**POST** `/subscription/create`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "providerId": "provider_id",
  "meals": ["lunch", "dinner"],
  "startDate": "2024-01-20",
  "duration": 30,
  "pricePerMeal": 100,
  "totalPrice": 6000
}
```

### 5.2 Get My Subscriptions
**GET** `/subscription/my-subscriptions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (string, optional): "active" | "paused" | "cancelled"

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "_id": "subscription_id",
        "provider": {
          "_id": "provider_id",
          "displayName": "Priya's Kitchen",
          "rating": 4.5,
          "location": { "area": "Koramangala" }
        },
        "meals": ["lunch", "dinner"],
        "status": "active",
        "startDate": "2024-01-20",
        "duration": 30,
        "pricePerMeal": 100,
        "totalPrice": 6000,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### 5.3 Update Subscription Status
**PUT** `/subscription/:subscriptionId/status`

**Request Body:**
```json
{
  "status": "active" | "paused" | "cancelled"
}
```

### 5.4 Pause Subscription
**PUT** `/subscription/:subscriptionId/pause`

**Request Body:**
```json
{
  "reason": "Out of town",
  "resumeDate": "2024-02-01"
}
```

---

## 6. Review & Rating Endpoints

### 6.1 Add Review
**POST** `/reviews`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "providerId": "provider_id",
  "subscriptionId": "subscription_id",
  "rating": 4.5,
  "comment": "Great food, very satisfied!",
  "aspects": {
    "taste": 5,
    "quality": 4,
    "quantity": 4,
    "packaging": 5,
    "timeliness": 4
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "review": {
      "_id": "review_id",
      "tenant": {
        "_id": "tenant_id",
        "displayName": "Aniket Sharma"
      },
      "providerId": "provider_id",
      "rating": 4.5,
      "comment": "Great food!",
      "aspects": { ... },
      "createdAt": "2024-01-20T10:00:00Z"
    }
  }
}
```

### 6.2 Get Provider Reviews
**GET** `/provider/:providerId/reviews`

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "tenantName": "Aniket Sharma",
        "rating": 4.5,
        "comment": "Great food!",
        "aspects": {
          "taste": 5,
          "quality": 4,
          "quantity": 4,
          "packaging": 5,
          "timeliness": 4
        },
        "date": "2024-01-20T10:00:00Z"
      }
    ],
    "totalReviews": 25,
    "averageRating": 4.5
  }
}
```

---

## 7. KYC Endpoints

### 7.1 Upload KYC Documents
**POST** `/kyc/upload`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "aadharNumber": "123456789012",
  "uploadedUrls": {
    "aadharFront": "https://cloudinary.com/...",
    "aadharBack": "https://cloudinary.com/...",
    "panCard": "https://cloudinary.com/..."
  }
}
```

### 7.2 Get KYC Status
**GET** `/kyc/status`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "kycStatus": "pending" | "verified" | "rejected",
    "remarks": "Documents verified successfully"
  }
}
```

### 7.3 Get KYC Documents
**GET** `/kyc/documents`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": {
      "aadharFront": "https://cloudinary.com/...",
      "aadharBack": "https://cloudinary.com/...",
      "panCard": "https://cloudinary.com/..."
    }
  }
}
```

### 7.4 Delete KYC Document
**DELETE** `/kyc/document/:docType`

**Headers:** `Authorization: Bearer <token>`

**docType:** "aadharFront" | "aadharBack" | "panCard"

### 7.5 Verify KYC (Admin)
**PUT** `/kyc/verify/:profileId`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "verified" | "rejected",
  "remarks": "Documents verified successfully"
}
```

### 7.6 Get Pending KYC (Admin)
**GET** `/kyc/pending`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingProviders": [...],
    "pendingTenants": [...]
  }
}
```

---

## 8. Admin Endpoints

### 8.1 Get Dashboard Stats
**GET** `/admin/stats`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProviders": 150,
      "activeProviders": 120,
      "totalTenants": 500,
      "activeTenants": 450,
      "activeSubscriptions": 300,
      "totalRevenue": 500000,
      "monthlyGrowth": 15.5,
      "pendingKYC": 10,
      "todayRegistrations": 5,
      "today": {
        "newRegistrations": 5,
        "newSubscriptions": 12,
        "revenue": 25400
      }
    }
  }
}
```

### 8.2 Get All Providers
**GET** `/admin/providers`

**Query Parameters:**
- `search` (string, optional): Search by name or email
- `status` (string, optional): "active" | "inactive"
- `kycStatus` (string, optional): "verified" | "pending" | "rejected"

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "_id": "provider_id",
        "name": "Provider Name",
        "displayName": "Priya's Kitchen",
        "email": "provider@email.com",
        "location": "Koramangala, Bangalore",
        "rating": 4.5,
        "currentTenants": 5,
        "maxTenants": 10,
        "kycStatus": "verified",
        "isActive": true,
        "isPremium": false
      }
    ]
  }
}
```

### 8.3 Get All Tenants
**GET** `/admin/tenants`

**Query Parameters:** Same as providers

**Response:**
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "_id": "tenant_id",
        "name": "Tenant Name",
        "displayName": "Aniket Sharma",
        "email": "tenant@email.com",
        "location": "Koramangala, Bangalore",
        "accommodationType": "pg",
        "activeSubscriptions": 2,
        "totalSpent": 12000,
        "kycStatus": "verified",
        "isActive": true,
        "isPremium": false
      }
    ]
  }
}
```

### 8.4 Get All Connection Requests (Admin)
**GET** `/admin/connection-requests`

**Query Parameters:**
- `status` (string, optional): "pending" | "accepted" | "rejected"

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "request_id",
        "tenant": {
          "_id": "tenant_id",
          "displayName": "Aniket Sharma",
          "email": "tenant@email.com",
          "monthlyBudget": 5000
        },
        "provider": {
          "_id": "provider_id",
          "displayName": "Priya's Kitchen",
          "email": "provider@email.com"
        },
        "message": "...",
        "monthlyBudget": 5000,
        "status": "pending",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### 8.5 Toggle User Status (Block/Unblock)
**PUT** `/admin/users/:userId/status`

**Request Body:**
```json
{
  "isActive": false
}
```

### 8.6 Delete User
**DELETE** `/admin/users/:userId`

**Headers:** `Authorization: Bearer <admin_token>`

### 8.7 Make Premium
**PUT** `/admin/providers/:userId/premium`

**Request Body:**
```json
{
  "isPremium": true
}
```

**PUT** `/admin/tenants/:userId/premium`

**Request Body:**
```json
{
  "isPremium": true
}
```

### 8.8 Get User Details (Admin)
**GET** `/admin/providers/:userId`
**GET** `/admin/tenants/:userId`

---

## 9. Data Models

### 9.1 Provider Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  displayName: String,
  bio: String,
  location: {
    address: String,
    area: String,
    city: String,
    state: String,
    pincode: String
  },
  cuisineTypes: [String],
  foodType: String, // "veg" | "non-veg" | "both"
  priceRange: {
    min: Number,
    max: Number
  },
  currentTenants: Number,
  maxTenants: Number,
  rating: Number,
  totalReviews: Number,
  mealsOffered: {
    breakfast: { available: Boolean, time: String },
    lunch: { available: Boolean, time: String },
    dinner: { available: Boolean, time: String }
  },
  menu: String,
  kycStatus: String, // "pending" | "verified" | "rejected"
  isActive: Boolean,
  isPremium: Boolean,
  contactEmail: String,
  contactPhone: String,
  tenantsInArea: Number,
  areaStats: {
    totalTenants: Number,
    area: String,
    city: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 9.2 Tenant Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  displayName: String,
  accommodationType: String, // "pg" | "hostel" | "flat"
  location: {
    address: String,
    area: String,
    city: String,
    state: String,
    pincode: String
  },
  foodPreferences: {
    type: String, // "veg" | "non-veg" | "both"
    cuisinePreferences: [String],
    tastePreference: String, // "mild" | "medium" | "spicy"
    allergies: [String],
    avoidItems: [String]
  },
  mealsRequired: {
    breakfast: { required: Boolean },
    lunch: { required: Boolean },
    dinner: { required: Boolean }
  },
  budgetRange: {
    min: Number,
    max: Number,
    perMeal: Boolean
  },
  monthlyBudget: Number, // REQUIRED
  kycStatus: String,
  isActive: Boolean,
  isPremium: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 9.3 Connection Request Model
```javascript
{
  _id: ObjectId,
  tenantId: ObjectId (ref: Tenant),
  providerId: ObjectId (ref: Provider),
  message: String,
  monthlyBudget: Number, // REQUIRED
  status: String, // "pending" | "accepted" | "rejected"
  createdAt: Date,
  updatedAt: Date
}
```

### 9.4 Subscription Model
```javascript
{
  _id: ObjectId,
  tenantId: ObjectId (ref: Tenant),
  providerId: ObjectId (ref: Provider),
  meals: [String], // ["breakfast", "lunch", "dinner"]
  status: String, // "active" | "paused" | "cancelled"
  startDate: Date,
  duration: Number, // days
  pricePerMeal: Number,
  totalPrice: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 9.5 Review Model
```javascript
{
  _id: ObjectId,
  tenantId: ObjectId (ref: Tenant),
  providerId: ObjectId (ref: Provider),
  subscriptionId: ObjectId (ref: Subscription),
  rating: Number, // 1-5
  comment: String,
  aspects: {
    taste: Number,
    quality: Number,
    quantity: Number,
    packaging: Number,
    timeliness: Number
  },
  createdAt: Date
}
```

### 9.6 KYC Document Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  role: String, // "provider" | "tenant"
  aadharNumber: String,
  documents: {
    aadharFront: String, // Cloudinary URL
    aadharBack: String,
    panCard: String
  },
  status: String, // "pending" | "verified" | "rejected"
  remarks: String,
  verifiedBy: ObjectId (ref: Admin),
  verifiedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 10. Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/aniketiffin

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Admin
ADMIN_EMAIL=admin@aniketiffin.com
ADMIN_PASSWORD=admin_password
ADMIN_CODE=admin_secret_code

# Cloudinary
CLOUDINARY_CLOUD_NAME=defgskoxv
CLOUDINARY_API_KEY=224233591747451
CLOUDINARY_API_SECRET=mNB4UwZzCFoCKTqAIHUajGeECmA
CLOUDINARY_UPLOAD_PRESET=x01b8cid

# EmailJS (for Contact Us form)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api

REACT_APP_CLOUDINARY_CLOUD_NAME=defgskoxv
REACT_APP_CLOUDINARY_API_KEY=224233591747451
REACT_APP_CLOUDINARY_API_SECRET=mNB4UwZzCFoCKTqAIHUajGeECmA
REACT_APP_CLOUDINARY_UPLOAD_PRESET=x01b8cid
REACT_APP_CLOUDINARY_IMAGE_UPLOAD_URL=https://api.cloudinary.com/v1_1/defgskoxv/image/upload
REACT_APP_CLOUDINARY_RAW_UPLOAD_URL=https://api.cloudinary.com/v1_1/defgskoxv/raw/upload

REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 11. Important Notes

### 11.1 Connection Request Flow
- When a tenant sends a connection request, it should notify BOTH the provider AND admin
- The request includes `monthlyBudget` from the tenant profile
- Provider can see tenant name and monthly budget in notifications
- Admin can see all connection requests with tenant and provider details

### 11.2 Contact Details Privacy
- Provider contact details (email, phone) should be HIDDEN from tenants
- Only admins can see full contact details
- Frontend hides contact details based on user role

### 11.3 Search Functionality
- Tenant search should support:
  - Search by name (provider name)
  - Budget range (min/max price)
  - Location (area, city)
  - Rating (minimum rating filter)
  - Additional filters: food type, meal type, cuisine

### 11.4 Provider Area Stats
- Provider profile should include `tenantsInArea` count
- This shows how many tenants are in the provider's area
- Helps providers understand market potential

### 11.5 Review & Rating
- Tenants can rate providers after subscription
- Rating includes overall rating (1-5) and aspect ratings
- Reviews update provider's average rating
- Only tenants with active/past subscriptions can review

### 11.6 Premium Membership
- Admins can make providers/tenants premium
- Premium status stored in `isPremium` field
- Can be used for future premium features

### 11.7 Monthly Budget
- Tenant profile MUST include `monthlyBudget` field
- This is sent with connection requests
- Displayed to providers when they receive requests

---

## 12. Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## End of Documentation

**Last Updated:** 2024-01-15  
**Version:** 1.0.0

