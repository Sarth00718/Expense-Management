# Exe$Man - Expense Management System

A comprehensive expense management system with OCR receipt scanning, multi-level approval workflows, and intelligent analytics.

## Features

- 🔐 JWT-based authentication with role-based access control
- 📸 OCR receipt scanning with Tesseract.js
- 💰 Multi-currency support with real-time conversion
- ✅ Multi-level approval workflows with conditional rules
- 📊 Interactive analytics dashboard
- 🔔 Real-time notifications with Socket.io
- 🎨 Dark-blue futuristic UI theme
- 📱 Fully responsive design

## Tech Stack

### Frontend
- React 18+ with Vite
- Tailwind CSS
- React Router
- Chart.js
- Tesseract.js
- Socket.io-client

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Socket.io
- Multer for file uploads

## Project Structure

```
exesman/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── context/    # React context
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Utility functions
│   └── package.json
├── backend/            # Express backend API
│   ├── config/         # Configuration files
│   ├── models/         # Mongoose models
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── package.json
└── README.md
```

## 📚 Documentation

This project includes comprehensive documentation:

| Document | Purpose | Audience |
|----------|---------|----------|
| **[HOW_TO_USE.md](HOW_TO_USE.md)** | Quick overview and navigation | All users |
| **[QUICK_START.md](QUICK_START.md)** | Fast setup and testing guide | New users |
| **[USER_GUIDE.md](USER_GUIDE.md)** | Complete user manual with API reference | All users |
| **[WORKFLOWS.md](WORKFLOWS.md)** | Visual workflow diagrams | Managers & Admins |
| **[.setup-complete.md](.setup-complete.md)** | Technical setup details | Developers |

**👉 First time here? Start with [QUICK_START.md](QUICK_START.md)**

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Quick Installation (3 Steps)

**Step 1: Start MongoDB**
```bash
mongod
```

**Step 2: Start Backend**
```bash
cd backend
npm run dev
```

**Step 3: Start Frontend**
```bash
cd frontend
npm run dev
```

**Step 4: Open Browser**
Navigate to: http://localhost:3000

**✅ Done! Create your admin account and start using the system.**

For detailed setup instructions, see **[QUICK_START.md](QUICK_START.md)**

### Full Installation (First Time)

1. Clone the repository
```bash
git clone <repository-url>
cd exesman
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Configure environment variables
```bash
cd ../backend
cp .env.example .env
# Edit .env with your configuration
```

5. Follow Quick Installation steps above

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Environment Variables

See `backend/.env.example` for required environment variables.

## User Roles

| Role | Capabilities | Use Case |
|------|-------------|----------|
| **Admin** | Full system access, user management, approval rules, override approvals, company-wide analytics | System administrator, Finance manager |
| **Manager** | Approve/reject team expenses, view team analytics, export reports, all employee features | Department head, Team lead |
| **Employee** | Submit expenses, upload receipts, track status, view personal history | All staff members |

**For detailed role instructions, see [USER_GUIDE.md](USER_GUIDE.md)**

## 🎯 Quick Use Cases

### For Employees
1. Login → Expenses → New Expense
2. Upload receipt (OCR extracts data automatically)
3. Review and submit for approval
4. Track status in real-time

### For Managers
1. Login → Approvals (see notification badge)
2. Review pending expenses
3. Approve or reject with comments
4. View team analytics

### For Admins
1. Login → Users → Add User
2. Create employee and manager accounts
3. Configure approval rules
4. Monitor company-wide analytics
5. Export monthly reports

**For complete workflows, see [WORKFLOWS.md](WORKFLOWS.md)**

## API Documentation

**For complete API reference, see [USER_GUIDE.md - API Reference Section](USER_GUIDE.md#api-reference)**

### Authentication Endpoints

#### POST /api/auth/signup
Create a new company and admin user.

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

**Response:**
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

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Get current user profile (requires authentication).

### User Management Endpoints

#### GET /api/users
List all users (Admin only).

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `role` - Filter by role

#### POST /api/users
Create new user (Admin only).

#### PUT /api/users/:id
Update user details.

#### DELETE /api/users/:id
Delete user (Admin only).

### Expense Endpoints

#### GET /api/expenses
List expenses (filtered by role).

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by status (draft, pending, approved, rejected)
- `category` - Filter by category
- `startDate` - Filter by date range
- `endDate` - Filter by date range

#### POST /api/expenses
Create new expense.

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
  "status": "pending"
}
```

#### GET /api/expenses/:id
Get expense details.

#### PUT /api/expenses/:id
Update expense (draft only).

#### DELETE /api/expenses/:id
Delete expense (draft only).

### Approval Endpoints

#### GET /api/approvals/pending
Get pending approvals for current user.

#### POST /api/approvals/:expenseId/approve
Approve an expense.

#### POST /api/approvals/:expenseId/reject
Reject an expense with comments.

**Request Body:**
```json
{
  "comment": "Reason for rejection"
}
```

#### POST /api/approvals/:expenseId/override
Admin override approval (Admin only).

#### GET /api/approvals/rules
List approval rules (Admin only).

#### POST /api/approvals/rules
Create approval rule (Admin only).

### Analytics Endpoints

#### GET /api/analytics/dashboard
Get dashboard statistics (role-based).

#### GET /api/analytics/expenses-by-category
Get expense breakdown by category.

#### GET /api/analytics/expenses-by-month
Get monthly expense trends.

#### GET /api/analytics/export
Export analytics report.

**Query Parameters:**
- `format` - Export format (pdf, excel)
- `startDate` - Date range start
- `endDate` - Date range end

### Currency Endpoints

#### GET /api/currency/list
Get list of supported currencies.

#### GET /api/currency/convert
Convert amount between currencies.

**Query Parameters:**
- `from` - Source currency code
- `to` - Target currency code
- `amount` - Amount to convert

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style

This project uses ESLint and Prettier for code formatting. Run linting with:

```bash
npm run lint
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# The build output will be in frontend/dist
```

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

**Port Already in Use**
- Change port in `.env` file
- Kill process using the port: `lsof -ti:5000 | xargs kill`

**OCR Not Working**
- Ensure receipt images are clear and well-lit
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 5MB

**Currency Conversion Fails**
- Check internet connectivity
- Verify Exchange Rate API is accessible
- System falls back to manual entry if API fails

## Performance Optimization

The application includes several performance optimizations:

- **Code Splitting**: Pages are lazy-loaded to reduce initial bundle size
- **Pagination**: Large lists are paginated (10 items per page by default)
- **Debouncing**: Search inputs are debounced (500ms delay)
- **Memoization**: Expensive calculations are cached
- **Image Optimization**: Receipt images are compressed before upload
- **API Caching**: Currency rates are cached for 1 hour

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting on authentication endpoints
- Secure file upload validation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📖 Documentation Guide

### New to Exe$Man?
1. Start with **[HOW_TO_USE.md](HOW_TO_USE.md)** for an overview
2. Follow **[QUICK_START.md](QUICK_START.md)** to set up and test
3. Reference **[USER_GUIDE.md](USER_GUIDE.md)** for detailed instructions

### Need to Understand Workflows?
- See **[WORKFLOWS.md](WORKFLOWS.md)** for visual diagrams
- Understand expense submission flow
- Learn approval processes
- View system integration maps

### Technical Setup?
- Check **[.setup-complete.md](.setup-complete.md)** for configuration
- Review project structure
- Understand dependencies
- Configure environment variables

## 🧪 Testing the System

### Quick Test (5 minutes)

1. **Create Admin Account**
   - Open http://localhost:3000
   - Sign up with your details
   - You're now admin!

2. **Add Test Users**
   - Create a manager account
   - Create an employee account
   - Assign manager to employee

3. **Test Expense Flow**
   - Login as employee
   - Submit expense with receipt
   - Login as manager
   - Approve the expense
   - Success! ✅

**For detailed test scenarios, see [QUICK_START.md](QUICK_START.md)**

## 🎓 Learning Resources

### Video Tutorials (Coming Soon)
- System overview
- Employee walkthrough
- Manager approval process
- Admin configuration

### Sample Data
See [QUICK_START.md](QUICK_START.md) for sample expenses to create during testing.

### Common Questions
See [USER_GUIDE.md - Troubleshooting](USER_GUIDE.md#troubleshooting) for answers to common questions.

## 🚀 Production Deployment

### Pre-Deployment Checklist
- [ ] Update JWT secret in production `.env`
- [ ] Configure production MongoDB URI
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up backup strategy
- [ ] Configure email notifications
- [ ] Test all features in staging
- [ ] Train users on the system
- [ ] Prepare support documentation

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-secure-secret-key
FRONTEND_URL=https://your-domain.com
EXCHANGE_RATE_API_KEY=your-api-key
```

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB (for receipts and database)
- **Node.js**: v18+
- **MongoDB**: v6+

### Recommended for Production
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Load Balancer**: For high availability
- **CDN**: For static assets

## 🔐 Security Considerations

- Change default JWT secret before production
- Use HTTPS in production
- Implement rate limiting on all endpoints
- Regular security audits
- Keep dependencies updated
- Implement backup strategy
- Use environment variables for secrets
- Enable MongoDB authentication
- Implement 2FA (coming soon)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write tests for new features
- Update documentation
- Keep commits atomic and descriptive

## 📞 Support

### Self-Help
1. Check **[USER_GUIDE.md](USER_GUIDE.md)** for detailed instructions
2. Review **[QUICK_START.md](QUICK_START.md)** for setup issues
3. See **[WORKFLOWS.md](WORKFLOWS.md)** for process questions

### Report Issues
For bugs and feature requests, please open an issue on the repository with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- System information (OS, Node version, etc.)

### Community
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and community support

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ User authentication and authorization
- ✅ Expense submission with receipt upload
- ✅ OCR receipt scanning
- ✅ Multi-currency support
- ✅ Approval workflows
- ✅ Real-time notifications
- ✅ Analytics and reporting

### Version 1.1 (Coming Soon)
- 📱 Mobile apps (iOS/Android)
- 📧 Email notifications
- 🔐 Two-factor authentication
- 📊 Advanced analytics dashboards
- 🔄 Bulk expense import
- 📝 Custom expense categories

### Version 2.0 (Future)
- 🌐 Multi-language support
- 🎯 Budget tracking and alerts
- 🔗 Accounting software integration
- 📱 Mobile receipt capture
- 🤖 AI-powered expense categorization
- 📈 Predictive analytics

## 📝 Changelog

### v1.0.0 (October 2024)
- Initial release
- Core expense management features
- OCR receipt scanning
- Multi-currency support
- Approval workflows
- Analytics and reporting
- Comprehensive documentation

## 🙏 Acknowledgments

- Tesseract.js for OCR capabilities
- Exchange Rate API for currency conversion
- MongoDB for database
- React and Express communities

## 📄 License

ISC

---

## 🎉 Quick Links

- **[Get Started Now](QUICK_START.md)** - 5-minute setup
- **[Complete User Guide](USER_GUIDE.md)** - Full documentation
- **[Visual Workflows](WORKFLOWS.md)** - Process diagrams
- **[How to Use](HOW_TO_USE.md)** - Overview guide

---

**Made with ❤️ for efficient expense management**

**Version:** 1.0.0 | **Last Updated:** October 2024
