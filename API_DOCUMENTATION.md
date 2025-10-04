# Exe$Man API Documentation

Complete API reference for the Exe$Man expense management system.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

Tokens are obtained through the login endpoint and expire after 24 hours.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... } // Optional, only in development
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_FIELD` | 400 | Unique field already exists |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Authentication Endpoints

### POST /auth/signup

Create a new company and admin user.

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Corp",
  "baseCurrency": "USD"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "email": "admin@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "companyId": "company-id"
    },
    "company": {
      "_id": "company-id",
      "name": "Acme Corp",
      "baseCurrency": "USD"
    },
    "token": "jwt-token"
  }
}
```

### POST /auth/login

Authenticate user and receive JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "company": { ... },
    "token": "jwt-token"
  }
}
```

### POST /auth/logout

Logout user (client-side token removal).

**Access:** Private

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /auth/me

Get current user profile.

**Access:** Private

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "email": "user@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee",
      "companyId": "company-id",
      "managerId": "manager-id"
    },
    "company": {
      "_id": "company-id",
      "name": "Acme Corp",
      "baseCurrency": "USD",
      "settings": { ... }
    }
  }
}
```

---

## User Management Endpoints

### GET /users

List all users in the company.

**Access:** Admin only

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `role` (string): Filter by role (employee, manager, admin)
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "user-id",
      "email": "user@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee",
      "managerId": "manager-id",
      "isActive": true,
      "createdAt": "2025-10-01T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /users

Create a new user.

**Access:** Admin only

**Request Body:**
```json
{
  "email": "newuser@company.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "employee",
  "managerId": "manager-id"
}
```

**Response:** `201 Created`

### GET /users/:id

Get user details by ID.

**Access:** Private (own profile or admin)

**Response:** `200 OK`

### PUT /users/:id

Update user details.

**Access:** Private (own profile or admin)

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "manager"
}
```

**Response:** `200 OK`

### DELETE /users/:id

Delete a user.

**Access:** Admin only

**Response:** `200 OK`

### PUT /users/:id/role

Update user role.

**Access:** Admin only

**Request Body:**
```json
{
  "role": "manager"
}
```

**Response:** `200 OK`

---

## Expense Endpoints

### GET /expenses

List expenses (filtered by role).

**Access:** Private

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status (draft, pending, approved, rejected)
- `category` (string): Filter by category
- `startDate` (date): Start date for range filter
- `endDate` (date): End date for range filter
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "expense-id",
      "employeeId": { ... },
      "amount": 150.50,
      "currency": "USD",
      "convertedAmount": 150.50,
      "category": "travel",
      "description": "Client meeting transportation",
      "date": "2025-10-03",
      "receiptUrl": "url-to-receipt",
      "status": "pending",
      "currentApproverId": "manager-id",
      "approvalHistory": [],
      "createdAt": "2025-10-03T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /expenses

Create a new expense.

**Access:** Private

**Request Body:**
```json
{
  "amount": 150.50,
  "currency": "USD",
  "convertedAmount": 150.50,
  "category": "travel",
  "description": "Client meeting transportation",
  "date": "2025-10-03",
  "receiptUrl": "url-to-receipt",
  "ocrData": {
    "vendor": "Uber",
    "extractedAmount": 150.50,
    "extractedDate": "2025-10-03",
    "confidence": 0.95
  },
  "status": "pending"
}
```

**Validation Rules:**
- `amount`: Required, positive number
- `currency`: Required, 3-letter currency code
- `category`: Required, one of: travel, food, office_supplies, entertainment, utilities, other
- `description`: Required, 3-500 characters
- `date`: Required, cannot be in future
- `status`: Optional, defaults to "draft"

**Response:** `201 Created`

### GET /expenses/:id

Get expense details by ID.

**Access:** Private (own expense, approver, or admin)

**Response:** `200 OK`

### PUT /expenses/:id

Update an expense (draft only).

**Access:** Private (own expense)

**Request Body:** Same as POST /expenses

**Response:** `200 OK`

### DELETE /expenses/:id

Delete an expense (draft only).

**Access:** Private (own expense or admin)

**Response:** `200 OK`

### GET /expenses/history

Get user's expense history.

**Access:** Private

**Query Parameters:** Same as GET /expenses

**Response:** `200 OK`

---

## Approval Endpoints

### GET /approvals/pending

Get pending approvals for current user.

**Access:** Manager or Admin

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "expense-id",
      "employeeId": {
        "_id": "employee-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@company.com"
      },
      "amount": 150.50,
      "currency": "USD",
      "category": "travel",
      "description": "Client meeting",
      "date": "2025-10-03",
      "receiptUrl": "url",
      "status": "pending",
      "createdAt": "2025-10-03T10:00:00.000Z"
    }
  ]
}
```

### POST /approvals/:expenseId/approve

Approve an expense.

**Access:** Manager or Admin (must be current approver)

**Request Body:**
```json
{
  "comment": "Approved - valid business expense"
}
```

**Response:** `200 OK`

### POST /approvals/:expenseId/reject

Reject an expense.

**Access:** Manager or Admin (must be current approver)

**Request Body:**
```json
{
  "comment": "Missing receipt - please resubmit with documentation"
}
```

**Response:** `200 OK`

### POST /approvals/:expenseId/override

Admin override approval.

**Access:** Admin only

**Request Body:**
```json
{
  "comment": "Override approved by admin"
}
```

**Response:** `200 OK`

### GET /approvals/rules

List all approval rules.

**Access:** Admin only

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "rule-id",
      "name": "Auto-approve small expenses",
      "type": "percentage",
      "conditions": {
        "percentageThreshold": 60
      },
      "isActive": true,
      "priority": 1
    }
  ]
}
```

### POST /approvals/rules

Create a new approval rule.

**Access:** Admin only

**Request Body:**
```json
{
  "name": "Auto-approve small expenses",
  "type": "percentage",
  "conditions": {
    "percentageThreshold": 60
  },
  "priority": 1
}
```

**Rule Types:**
- `percentage`: Auto-approve when X% of approvers approve
- `specific_approver`: Auto-approve when specific person approves
- `hybrid`: Combination of conditions

**Response:** `201 Created`

### PUT /approvals/rules/:id

Update an approval rule.

**Access:** Admin only

**Response:** `200 OK`

### DELETE /approvals/rules/:id

Delete an approval rule.

**Access:** Admin only

**Response:** `200 OK`

---

## Analytics Endpoints

### GET /analytics/dashboard

Get dashboard statistics (role-based).

**Access:** Private

**Query Parameters:**
- `startDate` (date): Start date for analytics
- `endDate` (date): End date for analytics

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalExpenses": 15000.00,
    "pendingExpenses": 2500.00,
    "approvedExpenses": 12000.00,
    "rejectedExpenses": 500.00,
    "expenseCount": {
      "total": 150,
      "pending": 25,
      "approved": 120,
      "rejected": 5
    },
    "categoryBreakdown": {
      "travel": 5000.00,
      "food": 3000.00,
      "office_supplies": 2000.00
    },
    "monthlyTrend": [
      { "month": "2025-08", "total": 4000.00 },
      { "month": "2025-09", "total": 5500.00 },
      { "month": "2025-10", "total": 5500.00 }
    ]
  }
}
```

### GET /analytics/expenses-by-category

Get expense breakdown by category.

**Access:** Manager or Admin

**Response:** `200 OK`

### GET /analytics/expenses-by-month

Get monthly expense trends.

**Access:** Manager or Admin

**Response:** `200 OK`

### GET /analytics/approval-stats

Get approval statistics.

**Access:** Manager or Admin

**Response:** `200 OK`

### GET /analytics/export

Export analytics report.

**Access:** Manager or Admin

**Query Parameters:**
- `format` (string): Export format (pdf, excel)
- `startDate` (date): Start date
- `endDate` (date): End date
- `category` (string): Filter by category

**Response:** File download

---

## Currency Endpoints

### GET /currency/list

Get list of supported currencies.

**Access:** Private

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "code": "USD",
      "name": "United States Dollar",
      "symbol": "$",
      "country": "United States"
    },
    {
      "code": "EUR",
      "name": "Euro",
      "symbol": "€",
      "country": "European Union"
    }
  ]
}
```

### GET /currency/convert

Convert amount between currencies.

**Access:** Private

**Query Parameters:**
- `from` (string): Source currency code
- `to` (string): Target currency code
- `amount` (number): Amount to convert

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "from": "USD",
    "to": "EUR",
    "amount": 100,
    "convertedAmount": 92.50,
    "rate": 0.925,
    "timestamp": "2025-10-04T12:00:00.000Z"
  }
}
```

---

## Notification Endpoints

### GET /notifications

Get user notifications.

**Access:** Private

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `unreadOnly` (boolean): Show only unread notifications

**Response:** `200 OK`

### PUT /notifications/:id/read

Mark notification as read.

**Access:** Private

**Response:** `200 OK`

### PUT /notifications/read-all

Mark all notifications as read.

**Access:** Private

**Response:** `200 OK`

---

## WebSocket Events

The application uses Socket.io for real-time notifications.

### Connection

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'jwt-token'
  }
});
```

### Events

#### Server → Client

- `notification`: New notification received
  ```javascript
  {
    type: 'expense_submitted',
    message: 'New expense requires approval',
    expenseId: 'expense-id',
    timestamp: '2025-10-04T12:00:00.000Z'
  }
  ```

- `expense_approved`: Expense was approved
- `expense_rejected`: Expense was rejected
- `approval_required`: Approval action required

---

## Rate Limiting

Authentication endpoints are rate-limited:
- Login: 5 requests per 15 minutes per IP
- Signup: 3 requests per hour per IP

Other endpoints: 100 requests per 15 minutes per user

---

## Changelog

### Version 1.0.0 (2025-10-04)
- Initial API release
- Authentication and user management
- Expense submission and approval
- Analytics and reporting
- Real-time notifications

---

For questions or issues, please contact the development team.
