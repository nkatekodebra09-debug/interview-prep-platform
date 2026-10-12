const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: null },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
  },
  { _id: false },
);

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    questionSet: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet', index: true },
    answers: { type: [answerSchema], default: [] },
    attemptNumber: { type: Number, default: 1 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
    instructorRating: { type: Number, min: 1, max: 5, default: null },
    instructorFeedback: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },

    score: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Submission', submissionSchema);
