import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return this.role === 'voter' || this.role === 'admin' || this.role === 'zone_admin' || this.role === 'national_admin';
    }
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['voter', 'admin', 'zone_admin', 'national_admin', 'candidate'],
    default: 'voter'
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  zone: {
    type: String,
    required: function() {
      return this.role !== 'national_admin' && this.role !== 'candidate';
    },
    trim: true
  },
  faceImages: [{
    type: String,
    required: function() {
      return this.role === 'voter';
    }
  }],
  isVerified: {
    type: Boolean,
    default: function() {
      return this.role === 'national_admin' || this.role === 'zone_admin' || this.role === 'admin';
    }
  },
  hasVoted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Generate auth token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { 
      id: this._id,
      role: this.role,
      region: this.region,
      zone: this.zone
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp before update
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Check if model exists before creating
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;