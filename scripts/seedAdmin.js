const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@aniketiffin.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@aniketiffin.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
      address: [],
    });

    console.log('✅ Admin user created successfully');
    console.log('Email: admin@aniketiffin.com');
    console.log('Password: admin123');
    console.log(`Admin Code: ${process.env.ADMIN_SECRET_CODE}`);
    console.log('\n⚠️  Please change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

