import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  region: {
    type: String,
    required: true
  },
  zone: {
    type: String,
    required: true
  },
  electionId: {
    type: String,
    default: null
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to prevent duplicate votes
voteSchema.index({ userId: 1, electionId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote; 