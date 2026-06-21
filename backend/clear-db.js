import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all data from all collections
    await Promise.all([
      mongoose.connection.db.collection('companies').deleteMany({}),
      mongoose.connection.db.collection('users').deleteMany({}),
      mongoose.connection.db.collection('expenses').deleteMany({}),
      mongoose.connection.db.collection('approvalrules').deleteMany({}),
    ]);

    console.log('✅ All data removed from database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();