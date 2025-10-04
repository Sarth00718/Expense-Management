// Quick startup test
import './config/config.js';
import './middleware/errorMiddleware.js';
import './controllers/authController.js';
import './controllers/expenseController.js';
import './controllers/userController.js';
import './controllers/approvalController.js';
import './controllers/analyticsController.js';
import './controllers/currencyController.js';
import './controllers/notificationController.js';

console.log('✅ All imports successful - no syntax errors!');
process.exit(0);
