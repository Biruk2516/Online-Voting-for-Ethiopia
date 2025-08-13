import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { MONGODB_URI } from '../config.js';

const createNationalAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if National Admin already exists
    const existingAdmin = await User.findOne({ email: 'national.admin@ethiopia.gov' });
    if (existingAdmin) {
      console.log('National Admin already exists');
      process.exit(0);
    }

    // Create National Admin user
    const hashedPassword = await bcrypt.hash('NationalAdmin@2024', 10);
    const nationalAdmin = new User({
      fullName: 'National Administrator',
      email: 'national.admin@ethiopia.gov',
      password: hashedPassword,
      role: 'national_admin',
      region: 'national',
      idNumber: 'NA123456789',
      isVerified: true
    });

    await nationalAdmin.save();
    console.log('National Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating National Admin:', error);
    process.exit(1);
  }
};

createNationalAdmin(); 