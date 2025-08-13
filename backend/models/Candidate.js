import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const voteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: false // optional
  },
  region: { type: String, required: true, default: 'Unknown' },
  count: {
    type: Number,
    default: 0
  },
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    region: {
      type: String,
      required: true,
      default: 'Unknown'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const candidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true, min: 21 },
  party: { type: String, required: true },
  constituency: { type: String, required: true, default: 'unknown' },
  bio: { type: String, required: true },
  criminalRecord: { type: String, enum: ['clean', 'pardoned', 'rehabilitated'], required: true },
  idNumber: { type: String, required: true, unique: true },
  image: { type: String },

  // Add email and password for login:
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // exclude password by default from queries
  },

  isIndependent: { type: Boolean, default: false },
  supportSignatures: { type: Number, default: 0 },

  elections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election'
  }],

  votes: [voteSchema]
}, { timestamps: true });

// Hash password before saving
candidateSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
candidateSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Candidate', candidateSchema);
