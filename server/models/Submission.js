import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  contestId: {
    type: Number,
  },
  creationTimeSeconds: {
    type: Number,
    required: true,
    index: true,
  },
  handle: {
    type: String,
    required: true,
    index: true,
  },
  problem: {
    contestId: {
      type: Number,
    },
    index: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
    },
    tags: [{
      type: String,
    }],
  },
  verdict: {
    type: String,
    required: true,
  },
  programmingLanguage: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
submissionSchema.index({ handle: 1, creationTimeSeconds: -1 });
submissionSchema.index({ handle: 1, verdict: 1, creationTimeSeconds: -1 });

export default mongoose.model('Submission', submissionSchema);