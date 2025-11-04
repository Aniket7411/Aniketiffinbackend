# Backend Requirement: Mobile Number Support

## Overview
Add mobile number (phone) field support across all user types (Tenants, Providers, Admins) and ensure proper visibility controls.

## Requirements

### 1. User Registration & Profile
- **All registration endpoints** should accept and store `phone` field:
  - `POST /auth/signup` (Tenant signup)
  - `POST /provider/register` (Provider registration)
  - `POST /tenant/register` (Tenant registration)
- **Validation**: Phone should be 10 digits (numeric only)
- **Storage**: Store phone number in user profile document/table
- **Profile Updates**: Allow phone number updates via profile edit endpoints

### 2. API Response Updates
Include `phone` field in all user profile responses:
- `GET /auth/profile` - Current user's profile
- `GET /provider/:id` - Provider details
- `GET /tenant/:id` - Tenant details
- `GET /admin/providers` - All providers list
- `GET /admin/tenants` - All tenants list
- `GET /admin/providers/:id` - Admin view of provider
- `GET /admin/tenants/:id` - Admin view of tenant

### 3. Visibility Rules
- **Admin**: Can see phone numbers of all users (providers and tenants)
- **Users**: Can see their own phone number in their profile
- **Privacy**: Tenants should NOT see provider phone numbers (only email for contact)
- **Providers**: Should NOT see tenant phone numbers (only basic info)

### 4. Connection Requests
- Include tenant's phone number in connection request notifications sent to:
  - Provider (if needed for business purposes)
  - Admin (for mediation/coordination)

### 5. Database Schema
Ensure phone field is added to:
- User/Provider collection/table
- Tenant collection/table
- Migration scripts if needed

## Example API Response Format

```json
{
  "data": {
    "user": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      // ... other fields
    }
  }
}
```

## Priority
**HIGH** - Frontend is already collecting phone numbers during signup and expects this field in all API responses.

