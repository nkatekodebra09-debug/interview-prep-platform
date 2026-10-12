const User = require('../models/User');
const QuestionSet = require('../models/questionSet');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const asyncHandler = require('../middleware/asyncHandler');

function safeUser(user) {
  const data = user.toObject();
  delete data.password;
  delete data.resetPasswordToken;
  return data;
}

async function getAllUsers(req, res) {
  const filter = {};
  if (req.query.role) filter.role = String(req.query.role);
  if (req.query.pending === 'true') filter.isApproved = false;

  const users = await User.find(filter)
    .select('-password -resetPasswordToken')
    .sort({ createdAt: -1 })
    .lean();
  res.json(users);
}

async function approveUser(req, res) {
  const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'User approved successfully', user: safeUser(user) });
}

async function setBlocked(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'You cannot block your own account' });
  }

  const blocked = req.body.blocked !== false;
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: blocked }, { new: true });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    message: blocked ? 'User has been blocked' : 'User has been unblocked',
    user: safeUser(user),
  });
}

async function deleteUser(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.role === 'admin') {
    return res
      .status(400)
      .json({ message: 'Admin accounts cannot be deleted from user management' });
  }

  const ownedSets =
    user.role === 'instructor'
      ? await QuestionSet.find({ createdBy: user._id }).distinct('_id')
      : [];
  await Promise.all([
    Submission.deleteMany({ $or: [{ student: user._id }, { questionSet: { $in: ownedSets } }] }),
    Question.deleteMany({ questionSet: { $in: ownedSets } }),
    QuestionSet.deleteMany({ createdBy: user._id }),
  ]);
  await user.deleteOne();
  res.json({ message: 'User and associated activity deleted' });
}

async function getSetsForReview(req, res) {
  const status = String(req.query.status || 'pending');
  const sets = await QuestionSet.find({ status })
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 })
    .lean();

  const questions = await Question.find({ questionSet: { $in: sets.map((set) => set._id) } })
    .sort({ createdAt: 1 })
    .lean();
  const questionsBySet = new Map();
  for (const question of questions) {
    const key = question.questionSet.toString();
    const { __v, ...safeQuestion } = question;
    questionsBySet.set(key, [...(questionsBySet.get(key) || []), safeQuestion]);
  }

  res.json(
    sets.map((set) => ({
      ...set,
      questions: questionsBySet.get(set._id.toString()) || [],
    })),
  );
}

async function reviewSet(req, res) {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
  }

  const existingSet = await QuestionSet.findById(req.params.id).select('status');
  if (!existingSet) {
    return res.status(404).json({ message: 'Question set not found' });
  }
  if (existingSet.status !== 'pending') {
    return res.status(400).json({ message: 'Only sets submitted for review can be moderated' });
  }

  if (status === 'approved') {
    const questionCount = await Question.countDocuments({ questionSet: req.params.id });
    if (!questionCount) {
      return res
        .status(400)
        .json({ message: 'Add at least one question before approving this set' });
    }
  }

  const set = await QuestionSet.findByIdAndUpdate(req.params.id, { status }, { new: true });

  if (!set) {
    return res.status(404).json({ message: 'Question set not found' });
  }

  res.json({ message: `Question set ${status}`, set });
}

async function getAnalytics(req, res) {
  const [
    usersByRole,
    pendingApprovals,
    blockedUsers,
    setsByStatus,
    totalQuestions,
    attemptSummary,
    topSets,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.countDocuments({ isApproved: false }),
    User.countDocuments({ isBlocked: true }),
    QuestionSet.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Question.countDocuments(),
    Submission.aggregate([
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' },
        },
      },
    ]),
    Submission.aggregate([
      { $group: { _id: '$questionSet', attempts: { $sum: 1 } } },
      { $sort: { attempts: -1 } },
      { $limit: 5 },
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
          title: '$set.title',
          category: '$set.category',
          attempts: 1,
        },
      },
    ]),
  ]);

  const toObject = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const attempts = attemptSummary[0] || { totalAttempts: 0, averagePercentage: 0 };

  res.json({
    users: {
      byRole: toObject(usersByRole),
      pendingApprovals,
      blocked: blockedUsers,
    },
    content: {
      setsByStatus: toObject(setsByStatus),
      totalQuestions,
    },
    attempts: {
      total: attempts.totalAttempts,
      averagePercentage: Math.round(attempts.averagePercentage || 0),
    },
    topSets,
  });
}

module.exports = {
  getAllUsers: asyncHandler(getAllUsers),
  approveUser: asyncHandler(approveUser),
  setBlocked: asyncHandler(setBlocked),
  deleteUser: asyncHandler(deleteUser),
  getSetsForReview: asyncHandler(getSetsForReview),
  reviewSet: asyncHandler(reviewSet),
  getAnalytics: asyncHandler(getAnalytics),
};
