const User = require('../models/User');
const QuestionSet = require('../models/QuestionSet');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const asyncHandler = require('../middleware/asyncHandler');

async function getAllUsers(req, res) {
  const filter = {};
  if (req.query.role) filter.role = String(req.query.role);
  if (req.query.pending === 'true') filter.isApproved = false;

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json(users);
}

async function approveUser(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'User approved successfully', user });
}

async function setBlocked(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'You cannot block your own account' });
  }

  const blocked = req.body.blocked !== false;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: blocked },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    message: blocked ? 'User has been blocked' : 'User has been unblocked',
    user,
  });
}

async function deleteUser(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await Submission.deleteMany({ student: user._id });
  res.json({ message: 'User deleted along with submissions' });
}

async function getSetsForReview(req, res) {
  const status = String(req.query.status || 'pending');
  const sets = await QuestionSet.find({ status })
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 });

  res.json(sets);
}

async function reviewSet(req, res) {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
  }

  const set = await QuestionSet.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

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

  const toObject = rows => Object.fromEntries(rows.map(r => [r._id, r.count]));
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

