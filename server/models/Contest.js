import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  contestId: {
    type: Number,
    required: true,
  },
  contestName: {
    type: String,
    required: true,
  },
  handle: {
    type: String,
    required: true,
    index: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  oldRating: {
    type: Number,
    required: true,
  },
  newRating: {
    type: Number,
    required: true,
  },
  ratingUpdateTimeSeconds: {
    type: Number,
    required: true,
  },
  creationTimeSeconds: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
contestSchema.index({ handle: 1, ratingUpdateTimeSeconds: -1 });

export default mongoose.model('Contest', contestSchema);