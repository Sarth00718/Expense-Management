/**
 * Test script to verify receipt upload functionality
 * Run this after starting the backend server
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads/receipts');

console.log('=== Receipt Upload Test ===\n');

// Check if upload directory exists
console.log('1. Checking upload directory...');
if (fs.existsSync(uploadDir)) {
  console.log('   ✓ Upload directory exists:', uploadDir);

  // Check permissions
  try {
    fs.accessSync(uploadDir, fs.constants.W_OK);
    console.log('   ✓ Directory is writable');
  } catch (err) {
    console.log('   ✗ Directory is NOT writable');
    console.log('   Error:', err.message);
  }

  // List existing files
  const files = fs.readdirSync(uploadDir);
  console.log(`   ✓ Found ${files.length} file(s) in directory`);
  if (files.length > 0) {
    console.log('   Files:', files.slice(0, 5).join(', '));
  }
} else {
  console.log('   ✗ Upload directory does NOT exist');
  console.log('   Creating directory...');
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('   ✓ Directory created successfully');
  } catch (err) {
    console.log('   ✗ Failed to create directory');
    console.log('   Error:', err.message);
  }
}

console.log('\n2. Checking environment variables...');
console.log('   UPLOAD_DIR:', process.env.UPLOAD_DIR || 'uploads/receipts (default)');
console.log('   MAX_FILE_SIZE:', process.env.MAX_FILE_SIZE || '5242880 (default 5MB)');

console.log('\n3. Upload endpoint configuration:');
console.log('   Endpoint: POST /api/expenses/upload-receipt');
console.log('   Field name: receipt');
console.log('   Allowed types: JPEG, PNG, GIF, WEBP, PDF');
console.log('   Max size:', (parseInt(process.env.MAX_FILE_SIZE) || 5242880) / 1024 / 1024, 'MB');

console.log('\n=== Test Complete ===\n');
console.log('To test upload from command line:');
console.log('curl -X POST http://localhost:5000/api/expenses/upload-receipt \\');
console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
console.log('  -F "receipt=@path/to/image.jpg"');
console.log('');
