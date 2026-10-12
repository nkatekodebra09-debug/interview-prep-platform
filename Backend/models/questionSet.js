const mongoose = require('mongoose');

const questionSetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    category: {
      type: String,
      enum: [
        'JavaScript',
        'React',
        'Node.js',
        'Databases',
        'System Design',
        'HR & Behavioural',
        'General',
      ],
      default: 'General',
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    timeLimitMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('QuestionSet', questionSetSchema);
