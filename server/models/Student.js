import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  codeforcesHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  currentRating: {
    type: Number,
    default: 0,
  },
  maxRating: {
    type: Number,
    default: 0,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  remindersSent: {
    type: Number,
    default: 0,
  },
  lastSubmissionDate: {
    type: Date,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Student', studentSchema);