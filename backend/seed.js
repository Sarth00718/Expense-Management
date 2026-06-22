import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from './models/Company.js';
import User from './models/User.js';
import Expense from './models/Expense.js';
import ApprovalRule from './models/ApprovalRule.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Company.deleteMany({}),
      User.deleteMany({}),
      Expense.deleteMany({}),
      ApprovalRule.deleteMany({}),
    ]);

    console.log('Cleared existing data');

    // Create company
    const company = new Company({
      name: 'InnovateTech Solutions Pvt Ltd',
      baseCurrency: 'INR',
      settings: {
        requireManagerApproval: true,
        escalateToAdmin: true,
        autoApprovalThreshold: 1000,
        enableOCR: true,
        enableRealTimeNotifications: true,
      },
    });
    await company.save();
    console.log('Created company:', company.name);

    // Create users (save one by one to trigger password hashing middleware)
    const admin = new User({
      email: 'admin@innovatetech.in',
      password: 'password123',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: 'admin',
      companyId: company._id,
      managerId: null,
    });
    const savedAdmin = await admin.save();

    const manager = new User({
      email: 'manager@innovatetech.in',
      password: 'password123',
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'manager',
      companyId: company._id,
      managerId: savedAdmin._id,
    });
    const savedManager = await manager.save();

    const employee1 = new User({
      email: 'amit.patel@innovatetech.in',
      password: 'password123',
      firstName: 'Amit',
      lastName: 'Patel',
      role: 'employee',
      companyId: company._id,
      managerId: savedManager._id,
    });
    const savedEmp1 = await employee1.save();

    const employee2 = new User({
      email: 'neha.singh@innovatetech.in',
      password: 'password123',
      firstName: 'Neha',
      lastName: 'Singh',
      role: 'employee',
      companyId: company._id,
      managerId: savedManager._id,
    });
    const savedEmp2 = await employee2.save();

    const employee3 = new User({
      email: 'rohan.verma@innovatetech.in',
      password: 'password123',
      firstName: 'Rohan',
      lastName: 'Verma',
      role: 'employee',
      companyId: company._id,
      managerId: savedManager._id,
    });
    const savedEmp3 = await employee3.save();

    console.log('Created users');

    // Create approval rules
    const approvalRules = [
      new ApprovalRule({
        companyId: company._id,
        name: 'Manager Approval for All Expenses',
        type: 'specific_approver',
        conditions: {
          specificApproverId: savedManager._id,
        },
        isActive: true,
        priority: 1,
      }),
      new ApprovalRule({
        companyId: company._id,
        name: 'Admin Approval for Large Expenses (>10,000 INR)',
        type: 'specific_approver',
        conditions: {
          specificApproverId: savedAdmin._id,
        },
        isActive: true,
        priority: 2,
      }),
    ];
    await ApprovalRule.insertMany(approvalRules);
    console.log('Created approval rules');

    // Helper function to generate dates in different months
    const getDate = (daysAgo, monthsAgo = 0) => {
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      date.setDate(date.getDate() - daysAgo);
      return date;
    };

    // Create realistic expenses across 3 months
    const expenses = [
      // Employee 1 expenses (May 2026
      {
        employeeId: savedEmp1._id,
        companyId: company._id,
        amount: 2000,
        currency: 'INR',
        convertedAmount: 2000,
        category: 'travel',
        description: 'Cab from home to office (OLA)',
        date: getDate(5, 1),
        createdAt: getDate(5, 1),
        status: 'approved',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'approved',
            comment: 'Looks good!',
            timestamp: getDate(4, 1),
          },
        ],
      },
      {
        employeeId: savedEmp1._id,
        companyId: company._id,
        amount: 1200,
        currency: 'INR',
        convertedAmount: 1200,
        category: 'food',
        description: 'Team lunch at Cafe Coffee Day',
        date: getDate(10, 1),
        createdAt: getDate(10, 1),
        status: 'approved',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'approved',
            comment: 'Approved',
            timestamp: getDate(9, 1),
          },
        ],
      },
      // Employee 1 (April 2026
      {
        employeeId: savedEmp1._id,
        companyId: company._id,
        amount: 8500,
        currency: 'INR',
        convertedAmount: 8500,
        category: 'travel',
        description: 'Flight to Mumbai',
        date: getDate(15, 2),
        createdAt: getDate(15, 2),
        status: 'approved',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'approved',
            comment: 'Approved',
            timestamp: getDate(14, 2),
          },
        ],
      },
      // Employee 1 (June 2026
      {
        employeeId: savedEmp1._id,
        companyId: company._id,
        amount: 1500,
        currency: 'INR',
        convertedAmount: 1500,
        category: 'travel',
        description: 'Cab from home to office (OLA)',
        date: getDate(1),
        createdAt: getDate(1),
        status: 'pending',
        currentApproverId: savedManager._id,
      },
      {
        employeeId: savedEmp1._id,
        companyId: company._id,
        amount: 850,
        currency: 'INR',
        convertedAmount: 850,
        category: 'food',
        description: 'Team lunch at Cafe Coffee Day',
        date: getDate(2),
        createdAt: getDate(2),
        status: 'approved',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'approved',
            comment: 'Looks good!',
            timestamp: getDate(1),
          },
        ],
      },
      {
        employeeId: savedEmp1._id,
        companyId: company._id,
        amount: 12500,
        currency: 'INR',
        convertedAmount: 12500,
        category: 'travel',
        description: 'Flight ticket to Delhi for client meeting',
        date: getDate(5),
        createdAt: getDate(5),
        status: 'pending',
        currentApproverId: savedAdmin._id,
      },
      {
        employeeId: savedEmp1._id,
        companyId: company._id,
        amount: 2500,
        currency: 'INR',
        convertedAmount: 2500,
        category: 'office_supplies',
        description: 'New wireless mouse and keyboard',
        date: getDate(7),
        createdAt: getDate(7),
        status: 'approved',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'approved',
            comment: 'Approved',
            timestamp: getDate(6),
          },
        ],
      },

      // Employee 2 expenses
      {
        employeeId: savedEmp2._id,
        companyId: company._id,
        amount: 450,
        currency: 'INR',
        convertedAmount: 450,
        category: 'food',
        description: 'Breakfast at office canteen',
        date: getDate(0),
        createdAt: getDate(0),
        status: 'draft',
        currentApproverId: null,
      },
      {
        employeeId: savedEmp2._id,
        companyId: company._id,
        amount: 3200,
        currency: 'INR',
        convertedAmount: 3200,
        category: 'utilities',
        description: 'Internet bill for work-from-home',
        date: getDate(10),
        createdAt: getDate(10),
        status: 'approved',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'approved',
            comment: 'Approved for WFH',
            timestamp: getDate(9),
          },
        ],
      },
      {
        employeeId: savedEmp2._id,
        companyId: company._id,
        amount: 8500,
        currency: 'INR',
        convertedAmount: 8500,
        category: 'travel',
        description: 'Hotel stay during business trip to Pune',
        date: getDate(14),
        createdAt: getDate(14),
        status: 'rejected',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'rejected',
            comment: 'Please provide hotel bill',
            timestamp: getDate(13),
          },
        ],
      },
      // Employee 2 (May 2026
      {
        employeeId: savedEmp2._id,
        companyId: company._id,
        amount: 3000,
        currency: 'INR',
        convertedAmount: 3000,
        category: 'travel',
        description: 'Flight to Bangalore',
        date: getDate(8, 1),
        createdAt: getDate(8, 1),
        status: 'approved',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'approved',
            comment: 'Approved',
            timestamp: getDate(7, 1),
          },
        ],
      },

      // Employee 3 expenses
      {
        employeeId: savedEmp3._id,
        companyId: company._id,
        amount: 1800,
        currency: 'INR',
        convertedAmount: 1800,
        category: 'entertainment',
        description: 'Team movie outing (team building activity)',
        date: getDate(3),
        createdAt: getDate(3),
        status: 'pending',
        currentApproverId: savedManager._id,
      },
      {
        employeeId: savedEmp3._id,
        companyId: company._id,
        amount: 750,
        currency: 'INR',
        convertedAmount: 750,
        category: 'food',
        description: 'Dinner with client',
        date: getDate(8),
        createdAt: getDate(8),
        status: 'approved',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'approved',
            comment: 'Client entertainment approved',
            timestamp: getDate(7),
          },
        ],
      },
      {
        employeeId: savedEmp3._id,
        companyId: company._id,
        amount: 5000,
        currency: 'INR',
        convertedAmount: 5000,
        category: 'office_supplies',
        description: 'Stationery items for team',
        date: getDate(12),
        createdAt: getDate(12),
        status: 'pending',
        currentApproverId: savedManager._id,
      },
      // Employee 3 (May 2026
      {
        employeeId: savedEmp3._id,
        companyId: company._id,
        amount: 1500,
        currency: 'INR',
        convertedAmount: 1500,
        category: 'food',
        description: 'Team dinner',
        date: getDate(12, 1),
        createdAt: getDate(12, 1),
        status: 'approved',
        currentApproverId: null,
        approvalHistory: [
          {
            approverId: savedManager._id,
            action: 'approved',
            comment: 'Approved',
            timestamp: getDate(11, 1),
          },
        ],
      },
    ];

    await Expense.insertMany(expenses);
    console.log('Created', expenses.length, 'expenses');

    console.log('\n✅ Seed data successfully created!');
    console.log('\n📧 Login Credentials:');
    console.log('   Admin: admin@innovatetech.in / password123');
    console.log('   Manager: manager@innovatetech.in / password123');
    console.log('   Employee 1: amit.patel@innovatetech.in / password123');
    console.log('   Employee 2: neha.singh@innovatetech.in / password123');
    console.log('   Employee 3: rohan.verma@innovatetech.in / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();