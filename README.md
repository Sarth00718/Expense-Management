# Exe$Man - Expense Management System

A comprehensive expense management system with OCR receipt scanning, multi-level approval workflows, and intelligent analytics.

## Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ Secure password hashing with bcrypt
- ✅ Session management with 24-hour token expiry

### Expense Management
- ✅ Create, edit, and delete expenses
- ✅ Upload receipt images (JPEG, PNG, WebP)
- ✅ OCR receipt scanning with Tesseract.js
- ✅ Multi-currency support with real-time conversion
- ✅ Expense categories (Travel, Food, Office Supplies, etc.)
- ✅ Draft and submit workflow
- ✅ Expense history and filtering

### Approval Workflows
- ✅ Multi-level approval system
- ✅ Manager approval for team expenses
- ✅ Admin override capability
- ✅ Approval rules configuration
- ✅ Approval history tracking
- ✅ Comments on approvals/rejections

### Analytics & Reporting
- ✅ Interactive dashboard with Chart.js
- ✅ Expense breakdown by category
- ✅ Monthly expense trends
- ✅ Role-based analytics (personal, team, company-wide)
- ✅ Export reports (PDF and Excel)
- ✅ Real-time statistics

### User Management
- ✅ Create and manage users (Admin only)
- ✅ Assign managers to employees
- ✅ Update user roles
- ✅ User activation/deactivation

### Real-time Features
- ✅ Real-time notifications with Socket.io
- ✅ Live expense status updates
- ✅ Instant approval notifications

### UI/UX
- ✅ Dark-blue futuristic theme
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Tailwind CSS styling
- ✅ Intuitive navigation
- ✅ Loading states and error handling

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
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── context/            # React context
│   │   ├── hooks/              # Custom hooks
│   │   └── utils/              # Utility functions
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── package.json
├── backend/                     # Express backend API
│   ├── config/                 # Configuration files
│   │   ├── config.js           # Environment config
│   │   └── database.js         # MongoDB connection
│   ├── models/                 # Mongoose models
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Custom middleware
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   │   └── notificationService.js  # Socket.io notifications
│   ├── utils/                  # Utility functions
│   ├── uploads/                # Receipt file storage
│   ├── server.js               # Express server entry
│   ├── .env.example            # Environment variables template
│   └── package.json
├── API_DOCUMENTATION.md         # Complete API reference
├── WORKFLOWS.md                 # Visual workflow diagrams
├── ADMIN_VS_USER_GUIDE.md      # Role comparison guide
└── README.md                    # This file
```

## 📚 Documentation

This project includes comprehensive documentation:

| Document | Purpose | Audience |
|----------|---------|----------|
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | Complete API reference with endpoints | Developers |
| **[WORKFLOWS.md](WORKFLOWS.md)** | Visual workflow diagrams and processes | Managers & Admins |
| **[ADMIN_VS_USER_GUIDE.md](ADMIN_VS_USER_GUIDE.md)** | Role comparison and capabilities | All users |

**👉 First time here? Follow the Quick Installation guide below**

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Quick Installation (4 Steps)

**Step 1: Start MongoDB**
```bash
mongod
```

**Step 2: Start Backend**
```bash
cd backend
npm run dev
```

**Step 3: Start Frontend** (in a new terminal)
```bash
cd frontend
npm run dev
```

**Step 4: Open Browser**
Navigate to: http://localhost:5173

**✅ Done! Create your admin account and start using the system.**

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
- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/exesman

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Client URL for CORS (update to match Vite dev server)
CLIENT_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=uploads/receipts
MAX_FILE_SIZE=5242880

# External APIs
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest
REST_COUNTRIES_API_URL=https://restcountries.com/v3.1/all
```

**Important:** Copy `backend/.env.example` to `backend/.env` and update the values, especially:
- `JWT_SECRET` - Use a strong random string in production
- `CLIENT_URL` - Set to `http://localhost:5173` for Vite dev server
- `MONGODB_URI` - Update if using a remote MongoDB instance

## User Roles

| Role | Capabilities | Use Case |
|------|-------------|----------|
| **Admin** | Full system access, user management, approval rules, override approvals, company-wide analytics | System administrator, Finance manager |
| **Manager** | Approve/reject team expenses, view team analytics, export reports, all employee features | Department head, Team lead |
| **Employee** | Submit expenses, upload receipts, track status, view personal history | All staff members |

**For detailed role comparison, see [ADMIN_VS_USER_GUIDE.md](ADMIN_VS_USER_GUIDE.md)**

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

**For complete API reference, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

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

# Note: Frontend tests not yet implemented
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
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running: `mongod` or start MongoDB service
- Check connection string in `backend/.env`
- Verify MongoDB is installed: `mongod --version`
- On Windows, start MongoDB service from Services app

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
- Change port in `backend/.env` file
- On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
- On Mac/Linux: `lsof -ti:5000 | xargs kill`

**CORS Error in Browser**
```
Access to XMLHttpRequest blocked by CORS policy
```
- Verify `CLIENT_URL` in `backend/.env` matches your frontend URL
- For Vite dev server, use `http://localhost:5173`
- Restart backend server after changing `.env`

**OCR Not Working**
- Ensure receipt images are clear and well-lit
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 5MB (configurable in `.env`)
- Check browser console for errors
- Tesseract.js downloads language data on first use

**Currency Conversion Fails**
- Check internet connectivity
- Verify Exchange Rate API is accessible
- System falls back to manual entry if API fails
- Check browser console for API errors

**Frontend Not Loading**
```
Failed to resolve module specifier
```
- Run `npm install` in frontend directory
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (requires v18+)

**Backend Crashes on Startup**
- Check all environment variables are set in `.env`
- Verify MongoDB is running and accessible
- Check for syntax errors in recent code changes
- Review server logs for specific error messages

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
1. Follow the **Quick Installation** guide above to set up
2. Create your admin account on first launch
3. Reference **[ADMIN_VS_USER_GUIDE.md](ADMIN_VS_USER_GUIDE.md)** for role-specific instructions

### Need to Understand Workflows?
- See **[WORKFLOWS.md](WORKFLOWS.md)** for visual diagrams
- Understand expense submission flow
- Learn approval processes
- View system integration maps

### Building with the API?
- Check **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** for complete endpoint reference
- Review authentication requirements
- Understand request/response formats
- See example API calls

## 🧪 Testing the System

### Quick Test (5 minutes)

1. **Create Admin Account**
   - Open http://localhost:5173
   - Sign up with your details
   - You're now admin!

2. **Add Test Users**
   - Navigate to Users section
   - Create a manager account
   - Create an employee account
   - Assign manager to employee

3. **Test Expense Flow**
   - Login as employee
   - Submit expense with receipt
   - Login as manager
   - Approve the expense
   - Success! ✅

**For detailed role capabilities, see [ADMIN_VS_USER_GUIDE.md](ADMIN_VS_USER_GUIDE.md)**

## 🎓 Learning Resources

### Documentation
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[WORKFLOWS.md](WORKFLOWS.md)** - Visual workflow diagrams
- **[ADMIN_VS_USER_GUIDE.md](ADMIN_VS_USER_GUIDE.md)** - Role comparison guide

### Sample Test Data
Create test expenses with these categories:
- Travel: Transportation, flights, hotels
- Food: Client meals, team lunches
- Office Supplies: Equipment, stationery
- Entertainment: Client entertainment
- Utilities: Internet, phone bills
- Other: Miscellaneous expenses

## 🚀 Production Deployment

### Pre-Deployment Checklist
- [ ] Update JWT secret in production `.env` (use strong random string)
- [ ] Configure production MongoDB URI (MongoDB Atlas recommended)
- [ ] Set up HTTPS/SSL certificates
- [ ] Update `CLIENT_URL` in backend `.env` to production domain
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Configure file upload storage (consider cloud storage)
- [ ] Set up backup strategy for MongoDB
- [ ] Test all features in staging environment
- [ ] Configure monitoring and logging
- [ ] Set up error tracking (e.g., Sentry)

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/exesman
JWT_SECRET=use-a-very-strong-random-secret-key-here
JWT_EXPIRES_IN=24h
CLIENT_URL=https://your-domain.com
UPLOAD_DIR=uploads/receipts
MAX_FILE_SIZE=5242880
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest
REST_COUNTRIES_API_URL=https://restcountries.com/v3.1/all
```

### Deployment Options

**Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)**
1. Set up Node.js and MongoDB on server
2. Clone repository
3. Install dependencies
4. Configure environment variables
5. Build frontend
6. Use PM2 to run backend: `pm2 start backend/server.js`
7. Configure Nginx as reverse proxy
8. Set up SSL with Let's Encrypt

**Option 2: Platform as a Service**
- **Backend**: Deploy to Heroku, Railway, or Render
- **Frontend**: Deploy to Vercel, Netlify, or Cloudflare Pages
- **Database**: Use MongoDB Atlas (free tier available)

**Option 3: Docker**
```bash
# Create Dockerfile for backend and frontend
# Use docker-compose for orchestration
docker-compose up -d
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

### Self-Help Resources
1. Check **[ADMIN_VS_USER_GUIDE.md](ADMIN_VS_USER_GUIDE.md)** for role-specific instructions
2. Review **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** for API issues
3. See **[WORKFLOWS.md](WORKFLOWS.md)** for process questions
4. Check the Troubleshooting section below

### Report Issues
For bugs and feature requests, please open an issue on the repository with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- System information (OS, Node version, MongoDB version)

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
  - Create, submit, and track expenses
  - Multi-level approval workflows
  - Role-based access control (Admin, Manager, Employee)
- OCR receipt scanning with Tesseract.js
- Multi-currency support with real-time conversion
- Real-time notifications via Socket.io
- Interactive analytics dashboard with Chart.js
- Export reports (PDF and Excel)
- Dark-blue futuristic UI with Tailwind CSS
- Comprehensive API documentation
- Visual workflow diagrams
- Role comparison guide

## 🙏 Acknowledgments

- **Tesseract.js** - OCR capabilities for receipt scanning
- **Exchange Rate API** - Real-time currency conversion
- **MongoDB** - Flexible document database
- **Socket.io** - Real-time bidirectional communication
- **Chart.js** - Beautiful interactive charts
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast frontend build tool
- **React** and **Express** communities for excellent documentation

## 📄 License

ISC

---

## 🎉 Quick Links

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Visual Workflows](WORKFLOWS.md)** - Process diagrams
- **[Role Comparison](ADMIN_VS_USER_GUIDE.md)** - Admin vs User guide

---

## 📋 Quick Reference

### Development Commands

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server with hot reload
npm start            # Start production server
npm test             # Run tests

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build

# MongoDB
mongod               # Start MongoDB server
mongo                # Open MongoDB shell
```

### Default Ports
- Frontend (Vite): `http://localhost:5173`
- Backend API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

### First-Time Setup
```bash
# 1. Clone and install
git clone <repository-url>
cd exesman
cd backend && npm install
cd ../frontend && npm install

# 2. Configure backend
cd backend
cp .env.example .env
# Edit .env and set CLIENT_URL=http://localhost:5173

# 3. Start MongoDB
mongod

# 4. Start backend (new terminal)
cd backend
npm run dev

# 5. Start frontend (new terminal)
cd frontend
npm run dev

# 6. Open browser
# Navigate to http://localhost:5173
```

---

**Made with ❤️ for efficient expense management**

**Version:** 1.0.0 | **Last Updated:** October 2024
