# ✅ Simplified Registration Flow

## 🎯 What Changed

Registration has been simplified to only require **basic information** during signup. Users can complete their profile details later.

---

## 📝 Minimum Required Fields

### **Provider Registration**
**POST** `/api/provider/register`

**Minimum Required:**
```json
{
  "name": "Aniket Sharma",
  "email": "sharma11aniket@gmail.com",
  "phone": "7275061192",
  "password": "Aniket@7411"
}
```

**Optional (can be added later):**
- displayName
- location (address, area, city, state, pincode)
- cuisineTypes
- foodType
- priceRange
- maxTenants

---

### **Tenant Registration**
**POST** `/api/tenant/register`

**Minimum Required:**
```json
{
  "name": "Aniket Sharma",
  "email": "sharma11aniket@gmail.com",
  "phone": "7275061192",
  "password": "Aniket@7411"
}
```

**Optional (can be added later):**
- displayName
- accommodationType
- location (address, area, city, state, pincode)
- foodPreferences
- mealsRequired
- budgetRange

---

## 🔄 Complete Profile Flow

### Step 1: Quick Registration (Just 4 Fields!)
```bash
curl -X POST http://localhost:5000/api/provider/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aniket Sharma",
    "email": "sharma11aniket@gmail.com",
    "phone": "7275061192",
    "password": "Aniket@7411"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Provider registered successfully. Please complete your profile and KYC verification.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Aniket Sharma",
      "email": "sharma11aniket@gmail.com",
      "role": "provider"
    },
    "provider": {
      "id": "provider_id",
      "displayName": "Aniket Sharma",
      "kycStatus": "pending"
    },
    "token": "jwt_token_here"
  }
}
```

---

### Step 2: Complete Profile (Later)
**PUT** `/api/provider/profile/me`

```bash
curl -X PUT http://localhost:5000/api/provider/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Serving authentic North Indian home food",
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
    "mealsOffered": {
      "lunch": {
        "available": true,
        "time": "12:00 PM - 2:00 PM"
      },
      "dinner": {
        "available": true,
        "time": "7:00 PM - 9:00 PM"
      }
    },
    "menuItems": [
      {
        "mealType": "lunch",
        "items": ["4 Roti", "Dal", "Rice", "Sabji", "Salad"],
        "description": "Complete home-style lunch",
        "price": 100,
        "isVeg": true
      }
    ]
  }'
```

---

### Step 3: Upload KYC (When Ready to Connect)
**POST** `/api/kyc/upload`

```json
{
  "aadharNumber": "1234-5678-9012",
  "aadharFront": "https://cloudinary.com/image1.jpg",
  "aadharBack": "https://cloudinary.com/image2.jpg",
  "photo": "https://cloudinary.com/photo.jpg",
  "addressProof": "https://cloudinary.com/address.jpg"
}
```

---

## 📊 Default Values

When you register with minimal info, these defaults are set:

### **Provider Defaults:**
```javascript
{
  displayName: name,  // Uses registration name
  location: {
    address: '',
    area: '',
    city: '',
    state: '',
    pincode: ''
  },
  cuisineTypes: [],
  foodType: 'veg',
  priceRange: { min: 0, max: 0 },
  maxTenants: 5,
  kycStatus: 'pending'
}
```

### **Tenant Defaults:**
```javascript
{
  displayName: name,  // Uses registration name
  accommodationType: 'pg',
  location: {
    address: '',
    area: '',
    city: '',
    state: '',
    pincode: ''
  },
  foodPreferences: {
    type: 'veg',
    cuisinePreferences: [],
    tastePreference: 'medium',
    allergies: [],
    avoidItems: []
  },
  mealsRequired: {
    breakfast: { required: false },
    lunch: { required: true },
    dinner: { required: true }
  },
  budgetRange: {
    min: 0,
    max: 0,
    perMeal: true
  },
  kycStatus: 'pending'
}
```

---

## 🎨 Frontend Implementation

### Registration Form (Minimal)
```jsx
<form onSubmit={handleRegister}>
  <input 
    type="text" 
    name="name" 
    placeholder="Full Name" 
    required 
  />
  <input 
    type="email" 
    name="email" 
    placeholder="Email" 
    required 
  />
  <input 
    type="tel" 
    name="phone" 
    placeholder="Phone (10 digits)" 
    pattern="[0-9]{10}"
    required 
  />
  <input 
    type="password" 
    name="password" 
    placeholder="Password (min 6 characters)" 
    minLength="6"
    required 
  />
  <button type="submit">Sign Up</button>
</form>
```

### After Registration
- Show welcome message
- Prompt user: "Complete your profile to get started"
- Show profile completion percentage
- Allow profile editing anytime

---

## ✅ Benefits

1. **Faster Registration** - Only 4 fields needed
2. **Better UX** - Users can signup quickly
3. **Gradual Onboarding** - Complete profile at their own pace
4. **Flexible** - Can still provide full data during signup if desired

---

## 🔒 Profile Completion Requirements

### To Search/Browse:
- ✅ Registration only (no profile completion needed)

### To Send Connection Request:
- ✅ Registration
- ✅ KYC verification
- ⚠️ Profile completion recommended (but not enforced)

### To Accept Tenants (Provider):
- ✅ Registration
- ✅ **Complete profile** (location, cuisine, pricing required)
- ✅ KYC verification

### To Create Subscription (Tenant):
- ✅ Registration
- ✅ KYC verification
- ⚠️ Profile preferences recommended

---

## 🚀 Testing

### Test Minimal Registration:
```bash
curl -X POST http://localhost:5000/api/provider/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "test123"
  }'
```

Should work perfectly! ✅

### Test Full Registration (Still Works):
```bash
curl -X POST http://localhost:5000/api/provider/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "test123",
    "displayName": "Test Kitchen",
    "location": {
      "address": "123 Street",
      "area": "Area",
      "city": "City",
      "state": "State",
      "pincode": "123456"
    },
    "cuisineTypes": ["North Indian"],
    "foodType": "veg",
    "priceRange": {
      "min": 80,
      "max": 150
    }
  }'
```

Also works perfectly! ✅

---

## 📱 Recommended Frontend Flow

1. **Registration Page** - Minimal form (name, email, phone, password)
2. **Welcome Page** - Show profile completion status
3. **Profile Setup Wizard** (Optional):
   - Step 1: Location details
   - Step 2: Food preferences / offerings
   - Step 3: Pricing / budget
   - Step 4: KYC upload
4. **Dashboard** - Show profile completion percentage
5. **Edit Profile** - Allow editing anytime

---

**That's it! Registration is now super simple!** 🎉

