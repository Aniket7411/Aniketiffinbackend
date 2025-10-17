# 🚀 AnikeTiffin - Complete API Documentation for Backend

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Provider APIs](#provider-apis)
5. [Tenant APIs](#tenant-apis)
6. [Connection & Request System](#connection-request-system)
7. [Notification System](#notification-system)
8. [Premium System](#premium-system)
9. [Admin APIs](#admin-apis)
10. [Data Models](#data-models)

---

## 🎯 Overview

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication

### 1. User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "Aniket Sharma",
  "email": "aniket@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Aniket Sharma",
      "email": "aniket@example.com",
      "phone": "9876543210",
      "role": "user",
      "isPremium": false,
      "premiumExpiresAt": null
    },
    "token": "jwt_token_here"
  }
}
```

---

### 2. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "aniket@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Aniket Sharma",
      "email": "aniket@example.com",
      "role": "provider",
      "isPremium": true,
      "premiumExpiresAt": "2025-01-17T00:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

---

### 3. Admin Login
**POST** `/auth/admin/login`

**Request Body:**
```json
{
  "email": "admin@aniketiffin.com",
  "password": "admin123",
  "adminCode": "ADMIN2024"
}
```

---

## 👤 User Management

### 4. Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Aniket Sharma",
      "email": "aniket@example.com",
      "role": "provider",
      "isPremium": true,
      "premiumExpiresAt": "2025-01-17T00:00:00Z",
      "notificationCount": 5
    }
  }
}
```

---

## 🍽️ Provider APIs

### 5. Provider Registration
**POST** `/provider/register`

**Request Body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

**Response:** Same as User Registration + role set to "provider"

---

### 6. Get Provider Profile
**GET** `/provider/profile/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": {
      "id": "provider_id",
      "userId": "user_id",
      "displayName": "Priya's Kitchen",
      "bio": "Serving authentic North Indian food with love",
      "location": {
        "address": "123 ABC Apartments",
        "area": "Koramangala",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560034",
        "coordinates": { "lat": 12.9352, "lng": 77.6245 }
      },
      "cuisineTypes": ["North Indian", "South Indian", "Chinese"],
      "foodType": "veg",
      "priceRange": { "min": 80, "max": 150 },
      "maxTenants": 8,
      "currentTenants": 3,
      "mealsOffered": {
        "breakfast": { "available": false, "time": "" },
        "lunch": { "available": true, "time": "12:00 PM - 2:00 PM" },
        "dinner": { "available": true, "time": "7:00 PM - 9:00 PM" }
      },
      "sampleFoodAvailable": true,
      "sampleFoodDetails": {
        "description": "Free sample meal for first-time tenants",
        "availableDays": ["Monday", "Wednesday", "Friday"],
        "bookingRequired": true
      },
      "rating": 4.8,
      "totalReviews": 45,
      "kycStatus": "verified",
      "isPremium": true,
      "premiumExpiresAt": "2025-01-17T00:00:00Z",
      "contactVisible": true,
      "createdAt": "2024-10-01T00:00:00Z"
    }
  }
}
```

---

### 7. Update Provider Profile
**PUT** `/provider/profile/me`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "displayName": "Priya's Home Kitchen",
  "bio": "Updated bio",
  "location": {
    "address": "123 ABC Apartments",
    "area": "Koramangala",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560034"
  },
  "cuisineTypes": ["North Indian", "Punjabi"],
  "foodType": "veg",
  "priceRange": { "min": 100, "max": 180 },
  "maxTenants": 10,
  "mealsOffered": {
    "breakfast": { "available": true, "time": "8:00 AM - 9:30 AM" },
    "lunch": { "available": true, "time": "12:00 PM - 2:00 PM" },
    "dinner": { "available": true, "time": "7:00 PM - 9:00 PM" }
  },
  "sampleFoodAvailable": true,
  "sampleFoodDetails": {
    "description": "Try our signature Dal Makhani",
    "availableDays": ["Monday", "Wednesday", "Friday"],
    "bookingRequired": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "provider": { /* updated provider object */ }
  }
}
```

---

### 8. Search Providers (Public - Limited Info)
**GET** `/provider/search`

**Query Parameters:**
```
?search=Priya
&area=Koramangala
&city=Bangalore
&cuisineType=North Indian
&foodType=veg
&minPrice=80
&maxPrice=150
&page=1
&limit=10
```

**Response (Non-Premium Users See Limited Info):**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "provider_id",
        "displayName": "Priya's Kitchen",
        "bio": "Serving authentic North Indian food",
        "location": {
          "area": "Koramangala",
          "city": "Bangalore"
          // NO address, pincode for non-premium
        },
        "cuisineTypes": ["North Indian", "South Indian"],
        "foodType": "veg",
        "priceRange": { "min": 80, "max": 150 },
        "mealsOffered": {
          "breakfast": { "available": false },
          "lunch": { "available": true },
          "dinner": { "available": true }
        },
        "sampleFoodAvailable": true,
        "rating": 4.8,
        "totalReviews": 45,
        "isPremium": true,
        "contactVisible": false // Hidden for non-premium tenants
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalResults": 45
    }
  }
}
```

---

### 9. Get Provider Details by ID
**GET** `/provider/:providerId`

**Response (Limited for Non-Premium):**
```json
{
  "success": true,
  "data": {
    "provider": {
      "id": "provider_id",
      "displayName": "Priya's Kitchen",
      "bio": "Serving authentic North Indian food with love",
      "location": {
        "area": "Koramangala",
        "city": "Bangalore"
        // Full address only visible if:
        // 1. Tenant is premium OR
        // 2. Connection request accepted
      },
      "cuisineTypes": ["North Indian", "South Indian"],
      "foodType": "veg",
      "priceRange": { "min": 80, "max": 150 },
      "mealsOffered": { /* ... */ },
      "sampleFoodAvailable": true,
      "sampleFoodDetails": {
        "description": "Try our signature Dal Makhani",
        "availableDays": ["Monday", "Wednesday", "Friday"],
        "bookingRequired": true
      },
      "rating": 4.8,
      "totalReviews": 45,
      "reviews": [
        {
          "tenantName": "Rahul K.",
          "rating": 5,
          "comment": "Excellent food quality!",
          "date": "2024-12-01"
        }
      ],
      "contactVisible": false, // Becomes true after connection accepted
      "phone": null, // Only visible if contactVisible = true
      "email": null,
      "canRequestConnection": true,
      "connectionStatus": null // "pending", "accepted", "rejected"
    }
  }
}
```

---

### 10. Get Provider Connection Requests
**GET** `/provider/connection-requests`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req_id",
        "tenant": {
          "id": "tenant_id",
          "displayName": "Rahul Kumar",
          "location": { "area": "HSR Layout", "city": "Bangalore" },
          "foodPreferences": { "type": "veg" },
          "budgetRange": { "min": 80, "max": 120 },
          "isPremium": false,
          "contactVisible": false // Until connection accepted
        },
        "message": "Hi, I'm looking for home-style veg food",
        "status": "pending",
        "createdAt": "2024-12-01T10:00:00Z"
      }
    ]
  }
}
```

---

## 🏠 Tenant APIs

### 11. Tenant Registration
**POST** `/tenant/register`

**Request Body:**
```json
{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "phone": "9876543211",
  "password": "password123"
}
```

---

### 12. Get Tenant Profile
**GET** `/tenant/profile/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "tenant_id",
      "userId": "user_id",
      "displayName": "Rahul Kumar",
      "accommodationType": "pg",
      "location": {
        "address": "456 XYZ PG",
        "area": "HSR Layout",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560102"
      },
      "foodPreferences": {
        "type": "veg",
        "cuisinePreferences": ["North Indian", "South Indian"],
        "tastePreference": "medium"
      },
      "mealsRequired": {
        "breakfast": { "required": false },
        "lunch": { "required": true },
        "dinner": { "required": true }
      },
      "budgetRange": { "min": 80, "max": 120, "perMeal": true },
      "isPremium": false,
      "premiumExpiresAt": null,
      "kycStatus": "pending"
    }
  }
}
```

---

### 13. Update Tenant Profile
**PUT** `/tenant/profile/me`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "displayName": "Rahul K.",
  "accommodationType": "pg",
  "location": {
    "address": "456 XYZ PG",
    "area": "HSR Layout",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560102"
  },
  "foodPreferences": {
    "type": "veg",
    "cuisinePreferences": ["North Indian", "Chinese"],
    "tastePreference": "spicy"
  },
  "mealsRequired": {
    "breakfast": { "required": false },
    "lunch": { "required": true },
    "dinner": { "required": true }
  },
  "budgetRange": { "min": 100, "max": 150, "perMeal": true }
}
```

---

## 🔗 Connection & Request System

### 14. Send Connection Request (Tenant to Provider)
**POST** `/connection/request`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "providerId": "provider_id",
  "message": "Hi, I'm interested in your tiffin service. I need lunch and dinner daily.",
  "sampleFoodRequest": true // Optional: Request sample food
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection request sent successfully",
  "data": {
    "request": {
      "id": "req_id",
      "tenantId": "tenant_id",
      "providerId": "provider_id",
      "message": "Hi, I'm interested...",
      "sampleFoodRequest": true,
      "status": "pending",
      "createdAt": "2024-12-15T10:00:00Z"
    }
  }
}
```

---

### 15. Respond to Connection Request (Provider)
**PUT** `/connection/respond/:requestId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "accepted", // or "rejected"
  "message": "Happy to serve you! Please contact me.",
  "sampleFoodApproved": true // If tenant requested sample
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request accepted successfully",
  "data": {
    "request": {
      "id": "req_id",
      "status": "accepted",
      "providerMessage": "Happy to serve you!",
      "sampleFoodApproved": true,
      "contactShared": true, // Now both can see each other's contact
      "updatedAt": "2024-12-15T11:00:00Z"
    }
  }
}
```

---

### 16. Get My Connection Requests (Tenant)
**GET** `/connection/my-requests`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req_id",
        "provider": {
          "id": "provider_id",
          "displayName": "Priya's Kitchen",
          "location": { "area": "Koramangala", "city": "Bangalore" },
          "rating": 4.8,
          "contactVisible": true, // After acceptance
          "phone": "9876543210", // Only if contactVisible
          "email": "priya@example.com"
        },
        "status": "accepted",
        "myMessage": "Hi, I'm interested...",
        "providerMessage": "Happy to serve you!",
        "sampleFoodApproved": true,
        "createdAt": "2024-12-15T10:00:00Z"
      }
    ]
  }
}
```

---

## 🔔 Notification System

### 17. Get Notifications
**GET** `/notifications`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
```
?page=1
&limit=20
&unreadOnly=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_id",
        "type": "connection_request",
        "title": "New Connection Request",
        "message": "Rahul Kumar sent you a connection request",
        "data": {
          "requestId": "req_id",
          "tenantId": "tenant_id",
          "tenantName": "Rahul Kumar"
        },
        "isRead": false,
        "createdAt": "2024-12-15T10:00:00Z"
      },
      {
        "id": "notif_id_2",
        "type": "request_accepted",
        "title": "Request Accepted",
        "message": "Priya's Kitchen accepted your connection request",
        "data": {
          "requestId": "req_id",
          "providerId": "provider_id",
          "providerName": "Priya's Kitchen"
        },
        "isRead": false,
        "createdAt": "2024-12-15T11:00:00Z"
      }
    ],
    "unreadCount": 2,
    "totalCount": 10
  }
}
```

---

### 18. Mark Notification as Read
**PUT** `/notifications/:notificationId/read`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 19. Get Unread Notification Count
**GET** `/notifications/unread-count`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

### 20. Mark All as Read
**PUT** `/notifications/mark-all-read`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 💎 Premium System

### 21. Check Premium Status
**GET** `/premium/status`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "isPremium": true,
    "premiumType": "admin_granted", // or "payment"
    "startDate": "2024-12-01T00:00:00Z",
    "expiresAt": "2025-12-01T00:00:00Z",
    "daysRemaining": 351,
    "benefits": [
      "See provider contact details",
      "Unlimited connection requests",
      "Priority customer support",
      "Advanced search filters"
    ]
  }
}
```

---

### 22. Get Premium Plans (Future - Payment Gateway)
**GET** `/premium/plans`

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "monthly",
        "name": "Monthly Premium",
        "price": 299,
        "duration": "30 days",
        "features": ["All premium benefits"]
      },
      {
        "id": "quarterly",
        "name": "Quarterly Premium",
        "price": 799,
        "duration": "90 days",
        "discount": "10%"
      },
      {
        "id": "yearly",
        "name": "Yearly Premium",
        "price": 2999,
        "duration": "365 days",
        "discount": "17%"
      }
    ]
  }
}
```

---

## 👑 Admin APIs

### 23. Get All Users
**GET** `/admin/users`

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
```
?role=provider // or tenant, user
&isPremium=true
&search=Priya
&page=1
&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "phone": "9876543210",
        "role": "provider",
        "isPremium": false,
        "premiumExpiresAt": null,
        "kycStatus": "verified",
        "isActive": true,
        "createdAt": "2024-10-01T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalUsers": 195
    }
  }
}
```

---

### 24. Grant Premium Access (Admin)
**POST** `/admin/users/:userId/grant-premium`

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "duration": 365, // days
  "reason": "Quality provider with excellent reviews"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Premium access granted successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Priya Sharma",
      "isPremium": true,
      "premiumType": "admin_granted",
      "premiumExpiresAt": "2025-12-15T00:00:00Z"
    }
  }
}
```

---

### 25. Revoke Premium Access (Admin)
**POST** `/admin/users/:userId/revoke-premium`

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "reason": "Violation of terms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Premium access revoked successfully"
}
```

---

### 26. Get Platform Statistics
**GET** `/admin/stats`

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 500,
    "totalProviders": 150,
    "totalTenants": 300,
    "totalAdmins": 5,
    "premiumUsers": 75,
    "activeConnections": 120,
    "pendingKYC": 25,
    "revenue": {
      "thisMonth": 45000,
      "lastMonth": 38000,
      "growth": "18.4%"
    }
  }
}
```

---

## 📊 Data Models

### User Schema
```javascript
{
  id: ObjectId,
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  role: Enum ['user', 'provider', 'tenant', 'admin'],
  isPremium: Boolean (default: false),
  premiumType: Enum ['payment', 'admin_granted', null],
  premiumStartDate: Date,
  premiumExpiresAt: Date,
  isActive: Boolean (default: true),
  kycStatus: Enum ['pending', 'verified', 'rejected'],
  createdAt: Date,
  updatedAt: Date
}
```

---

### Provider Schema
```javascript
{
  id: ObjectId,
  userId: ObjectId (ref: User),
  displayName: String,
  bio: String,
  location: {
    address: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number }
  },
  cuisineTypes: [String],
  foodType: Enum ['veg', 'non-veg', 'both'],
  priceRange: { min: Number, max: Number },
  maxTenants: Number,
  currentTenants: Number (default: 0),
  mealsOffered: {
    breakfast: { available: Boolean, time: String },
    lunch: { available: Boolean, time: String },
    dinner: { available: Boolean, time: String }
  },
  sampleFoodAvailable: Boolean (default: false),
  sampleFoodDetails: {
    description: String,
    availableDays: [String],
    bookingRequired: Boolean
  },
  rating: Number (default: 0),
  totalReviews: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

---

### Tenant Schema
```javascript
{
  id: ObjectId,
  userId: ObjectId (ref: User),
  displayName: String,
  accommodationType: Enum ['pg', 'hostel', 'flat'],
  location: {
    address: String,
    area: String,
    city: String,
    state: String,
    pincode: String
  },
  foodPreferences: {
    type: Enum ['veg', 'non-veg', 'both'],
    cuisinePreferences: [String],
    tastePreference: Enum ['mild', 'medium', 'spicy']
  },
  mealsRequired: {
    breakfast: { required: Boolean },
    lunch: { required: Boolean },
    dinner: { required: Boolean }
  },
  budgetRange: { min: Number, max: Number, perMeal: Boolean },
  createdAt: Date,
  updatedAt: Date
}
```

---

### Connection Request Schema
```javascript
{
  id: ObjectId,
  tenantId: ObjectId (ref: Tenant),
  providerId: ObjectId (ref: Provider),
  message: String,
  sampleFoodRequest: Boolean (default: false),
  sampleFoodApproved: Boolean,
  status: Enum ['pending', 'accepted', 'rejected'],
  providerMessage: String,
  contactShared: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

---

### Notification Schema
```javascript
{
  id: ObjectId,
  userId: ObjectId (ref: User),
  type: Enum ['connection_request', 'request_accepted', 'request_rejected', 'premium_granted', 'kyc_verified'],
  title: String,
  message: String,
  data: Object, // Additional data specific to notification type
  isRead: Boolean (default: false),
  createdAt: Date
}
```

---

## 🔒 Premium Visibility Rules

### For Non-Premium Users:
1. **Can See:**
   - Provider display name
   - Bio (limited)
   - Area and City (NOT full address)
   - Cuisine types
   - Food type
   - Price range
   - Ratings and reviews
   - Sample food availability

2. **Cannot See:**
   - Full address and pincode
   - Phone number
   - Email address
   - Detailed location

### For Premium Users:
1. **Additional Access:**
   - All provider details (if provider is premium OR connection accepted)
   - Contact details after connection accepted
   - Unlimited connection requests

### After Connection Accepted:
1. **Both parties can see:**
   - Full contact details
   - Complete address
   - Direct communication possible

---

## 🎯 Notification Types

| Type | Trigger | Recipient |
|------|---------|-----------|
| `connection_request` | Tenant sends request | Provider |
| `request_accepted` | Provider accepts | Tenant |
| `request_rejected` | Provider rejects | Tenant |
| `premium_granted` | Admin grants premium | User |
| `premium_expiring` | 7 days before expiry | User |
| `kyc_verified` | Admin verifies KYC | User |

---

## ✅ Success Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

---

## ❌ Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

---

## 🚀 Implementation Priority

### Phase 1 (Critical):
1. Authentication (Register, Login)
2. Provider/Tenant Profile (CRUD)
3. Search Providers
4. Connection Request System

### Phase 2 (Important):
1. Notification System
2. Premium Status Check
3. Admin Premium Grant

### Phase 3 (Enhancement):
1. Sample Food System
2. Payment Gateway Integration
3. Advanced Search Filters

---

**This documentation is complete and ready for backend implementation! 🎉**

