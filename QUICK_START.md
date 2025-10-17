# ⚡ Quick Start Guide - 2 Minutes to Run!

## 🚀 Get Started in 3 Commands

```bash
# 1. Install dependencies
npm install

# 2. Create admin user
npm run seed:admin

# 3. Start server
npm run dev
```

✅ Server running at http://localhost:5000

---

## 🧪 Test It Works

### Health Check:
```bash
curl http://localhost:5000/api/health
```

### Register a Provider:
```bash
curl -X POST http://localhost:5000/api/provider/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Provider",
    "email": "provider@test.com",
    "phone": "9876543210",
    "password": "test123"
  }'
```

### Register a Tenant:
```bash
curl -X POST http://localhost:5000/api/tenant/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tenant",
    "email": "tenant@test.com",
    "phone": "9876543211",
    "password": "test123"
  }'
```

---

## 📖 API Documentation

**Main Doc:** `COMPLETE_API_DOCUMENTATION.md`

Quick reference:
- Base URL: `http://localhost:5000/api`
- All responses: `{ success: boolean, data?: object, message?: string }`
- Protected routes need: `Authorization: Bearer <token>`

---

## 🔑 Default Admin

After running `npm run seed:admin`:

- **Email:** admin@aniketiffin.com
- **Password:** admin123
- **Admin Code:** SECURE_ADMIN_CODE_123

---

## 🎯 Key Endpoints for Frontend

### Registration/Login:
```
POST /api/provider/register - Provider signup
POST /api/tenant/register - Tenant signup  
POST /api/auth/login - Login
GET  /api/auth/me - Get current user
```

### Providers:
```
GET  /api/provider/search - Browse providers
GET  /api/provider/:id - Provider details
PUT  /api/provider/profile/me - Update profile
```

### Connections:
```
POST /api/connection/request - Send request
PUT  /api/connection/respond/:id - Accept/reject
GET  /api/connection/my-requests - My requests
```

### Notifications:
```
GET  /api/notifications - Get notifications
GET  /api/notifications/unread-count - Unread count
```

### Premium:
```
GET  /api/premium/status - Check premium
GET  /api/premium/plans - Get plans
```

---

## 💡 What's Special

1. **Minimal Registration** - Only 4 fields needed!
2. **Contact Privacy** - Hidden until premium or connection accepted
3. **Notifications** - Auto-created on actions
4. **Sample Food** - Tenants can request sample meals
5. **Profile Completion** - Auto-tracked percentage

---

## 🔧 Troubleshooting

### MongoDB not connected?
```bash
# Make sure MongoDB is running
mongod
```

### Port 5000 in use?
Change PORT in `.env` file

### Need to reset database?
```bash
mongosh
use aniketiffin
db.dropDatabase()
exit
npm run seed:admin
```

---

**That's it! Backend is ready! Start building frontend! 🎉**

