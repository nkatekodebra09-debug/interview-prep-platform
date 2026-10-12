const Submission = require('../models/Submission');
const Question = require('../models/Question');
const QuestionSet = require('../models/questionSet');
const asyncHandler = require('../middleware/asyncHandler');

function buildReview(questions, answers) {
  const answerMap = new Map(answers.map((a) => [a.question.toString(), a]));
  return questions.map((q) => {
    const given = answerMap.get(q._id.toString()) || {};
    return {
      question: q._id,
      text: q.text,
      type: q.type,
      yourAnswer: given.answer || '',
      isCorrect: given.isCorrect ?? null,
      correctAnswer: q.type === 'mcq' ? q.correctAnswer : null,
      instructorFeedback: given.feedback || '',
    };
  });
}

const submitAttempt = asyncHandler(async (req, res) => {
  const { questionSet: setId, answers = [], timeTakenSeconds = 0 } = req.body;

  const set = await QuestionSet.findById(setId);
  if (!set || set.status !== 'approved') {
    return res.status(404).json({ message: 'Question set not found or not approved' });
  }

  const questions = await Question.find({ questionSet: set._id }).sort({ createdAt: 1 });
  if (!questions.length) {
    return res.status(400).json({ message: 'This set has no questions yet' });
  }
  if (!Array.isArray(answers) || answers.length > questions.length) {
    return res
      .status(400)
      .json({ message: 'Answers must be a list containing no more than one answer per question' });
  }

  const validQuestionIds = new Set(questions.map((question) => question._id.toString()));
  const submittedQuestionIds = answers.map((item) => String(item.question));
  if (
    submittedQuestionIds.some((questionId) => !validQuestionIds.has(questionId)) ||
    new Set(submittedQuestionIds).size !== submittedQuestionIds.length
  ) {
    return res.status(400).json({ message: 'Answers contain an invalid or repeated question' });
  }

  const given = new Map(answers.map((a) => [String(a.question), String(a.answer ?? '')]));
  let score = 0,
    maxScore = 0;

  const graded = questions.map((q) => {
    const answer = given.get(q._id.toString()) || '';
    let isCorrect = null,
      points = 0;

    if (q.type === 'mcq') {
      maxScore++;
      isCorrect = answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) points = 1;
    }

    score += points;
    return { question: q._id, answer, isCorrect, score: points };
  });

  const percentage = maxScore ? Math.round((score / maxScore) * 100) : 0;
  const previous = await Submission.countDocuments({ student: req.user.id, questionSet: set._id });

  const submission = await Submission.create({
    student: req.user.id,
    questionSet: set._id,
    answers: graded,
    score,
    maxScore,
    percentage,
    attemptNumber: previous + 1,
    timeTakenSeconds: Math.max(0, Number(timeTakenSeconds) || 0),
  });

  res.status(201).json({ submission, review: buildReview(questions, graded) });
});

const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await Submission.find({ student: req.user.id })
    .select('-answers')
    .populate('questionSet', 'title category difficulty')
    .sort({ createdAt: -1 });

  res.json(attempts);
});

const getAttemptById = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({
    _id: req.params.id,
    student: req.user.id,
  }).populate('questionSet', 'title category difficulty');

  if (!submission) {
    return res.status(404).json({ message: 'Attempt not found' });
  }

  const questions = await Question.find({ questionSet: submission.questionSet._id }).sort({
    createdAt: 1,
  });
  res.json({ submission, review: buildReview(questions, submission.answers) });
});

const getPerformance = asyncHandler(async (req, res) => {
  const setFilter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
  const setIds = (await QuestionSet.find(setFilter).select('_id')).map((s) => s._id);

  const students = await Submission.aggregate([
    { $match: { questionSet: { $in: setIds } } },
    {
      $group: {
        _id: '$student',
        attempts: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' },
        bestPercentage: { $max: '$percentage' },
        lastAttempt: { $max: '$createdAt' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        studentId: '$_id',
        username: '$student.username',
        email: '$student.email',
        attempts: 1,
        averagePercentage: { $round: ['$averagePercentage', 1] },
        bestPercentage: 1,
        lastAttempt: 1,
      },
    },
    { $sort: { averagePercentage: -1 } },
  ]);

  const sets = await Submission.aggregate([
    { $match: { questionSet: { $in: setIds } } },
    {
      $group: {
        _id: '$questionSet',
        attempts: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' },
      },
    },
    {
      $lookup: {
        from: 'questionsets',
        localField: '_id',
        foreignField: '_id',
        as: 'set',
      },
    },
    { $unwind: '$set' },
    {
      $project: {
        setId: '$_id',
        title: '$set.title',
        attempts: 1,
        averagePercentage: { $round: ['$averagePercentage', 1] },
      },
    },
    { $sort: { attempts: -1 } },
  ]);

  res.json({ students, sets });
});

const getInstructorSubmissions = asyncHandler(async (req, res) => {
  const setFilter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
  const setIds = await QuestionSet.find(setFilter).distinct('_id');
  const submissions = await Submission.find({ questionSet: { $in: setIds } })
    .populate('student', 'username email')
    .populate('questionSet', 'title category difficulty')
    .populate('answers.question', 'text type options correctAnswer')
    .sort({ createdAt: -1 })
    .lean();

  res.json(submissions);
});

const reviewSubmission = asyncHandler(async (req, res) => {
  const rating = Number(req.body.rating);
  const feedback = String(req.body.feedback || '').trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
  }
  if (!feedback) {
    return res.status(400).json({ message: 'Written feedback is required' });
  }

  const submission = await Submission.findById(req.params.id)
    .populate('questionSet', 'createdBy')
    .populate('answers.question', 'type');
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }
  if (req.user.role !== 'admin' && submission.questionSet?.createdBy?.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: 'You can only review submissions to your question sets' });
  }

  submission.instructorRating = rating;
  submission.instructorFeedback = feedback;
  const answerFeedback = new Map(
    (Array.isArray(req.body.answerFeedback) ? req.body.answerFeedback : []).map((item) => [
      String(item.question),
      String(item.feedback || '').trim(),
    ]),
  );
  for (const answer of submission.answers) {
    const questionId = answer.question?._id?.toString() || answer.question.toString();
    const questionType = answer.question?.type;
    if (questionType === 'descriptive' && answerFeedback.has(questionId)) {
      const writtenFeedback = answerFeedback.get(questionId);
      if (writtenFeedback.length > 2000) {
        return res
          .status(400)
          .json({ message: 'Question feedback must be 2000 characters or fewer' });
      }
      answer.feedback = writtenFeedback;
    }
  }
  submission.reviewedBy = req.user.id;
  submission.reviewedAt = new Date();
  await submission.save();

  res.json({ message: 'Student progress review saved', submission });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const leaders = await Submission.aggregate([
    {
      $group: {
        _id: '$student',
        attempts: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' },
        bestPercentage: { $max: '$percentage' },
      },
    },
    { $sort: { averagePercentage: -1, attempts: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        username: '$student.username',
        attempts: 1,
        bestPercentage: 1,
        averagePercentage: { $round: ['$averagePercentage', 1] },
      },
    },
  ]);

  res.json(leaders);
});

module.exports = {
  submitAttempt,
  getMyAttempts,
  getAttemptById,
  getPerformance,
  getInstructorSubmissions,
  reviewSubmission,
  getLeaderboard,
};
