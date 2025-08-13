import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true,
    enum: [
      "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", 
      "Dire Dawa", "Gambela", "Harari", "Oromia", 
      "Sidama", "Somali", "Southern Nations", 
      "South West Ethiopia", "Tigray"
    ]
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  candidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Election', electionSchema);