const QuestionSet = require('../models/questionSet');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const asyncHandler = require('../middleware/asyncHandler');

const isOwnerOrAdmin = (set, user) => user.role === 'admin' || set.createdBy.toString() === user.id;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createQuestionSet = asyncHandler(async (req, res) => {
  const { title, description, category, difficulty, timeLimitMinutes } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const set = await QuestionSet.create({
    title,
    description,
    category,
    difficulty,
    timeLimitMinutes,
    createdBy: req.user.id,
    status: req.user.role === 'admin' ? 'approved' : 'draft',
  });

  res.status(201).json(set);
});

const getQuestionSets = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'student') {
    filter.status = 'approved';
  } else if (req.user.role === 'instructor') {
    filter.$or = [{ status: 'approved' }, { createdBy: req.user.id }];
  }

  if (req.query.mine === 'true') {
    delete filter.$or;
    filter.createdBy = req.user.id;
  }

  if (req.query.category) {
    filter.category = String(req.query.category);
  }

  if (req.query.difficulty) {
    filter.difficulty = String(req.query.difficulty);
  }

  if (req.query.search) {
    filter.title = new RegExp(escapeRegex(String(req.query.search)), 'i');
  }

  const sets = await QuestionSet.find(filter)
    .populate('createdBy', 'username')
    .sort('-createdAt')
    .lean();

  const counts = await Question.aggregate([
    { $match: { questionSet: { $in: sets.map((s) => s._id) } } },
    { $group: { _id: '$questionSet', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((count) => [count._id.toString(), count.count]));

  const result = sets.map((set) => ({
    ...set,
    questionCount: countMap.get(set._id.toString()) || 0,
  }));

  res.json(req.user.role === 'student' ? result.filter((set) => set.questionCount > 0) : result);
});

const getQuestionSetById = asyncHandler(async (req, res) => {
  const set = await QuestionSet.findById(req.params.id).populate('createdBy', 'username').lean();

  if (!set) {
    return res.status(404).json({ message: 'Question set not found' });
  }

  const owner = req.user.role === 'admin' || set.createdBy._id.toString() === req.user.id;
  if (!owner && set.status !== 'approved') {
    return res.status(403).json({ message: 'This question set is not available' });
  }

  let questions = await Question.find({ questionSet: set._id }).sort('createdAt').lean();

  if (!owner) {
    questions = questions.map(({ correctAnswer, ...safe }) => safe); // eslint-disable-line no-unused-vars
  }

  res.json({ ...set, questions });
});

const updateQuestionSet = asyncHandler(async (req, res) => {
  const set = await QuestionSet.findById(req.params.id);

  if (!set) {
    return res.status(404).json({ message: 'Question set not found' });
  }

  if (!isOwnerOrAdmin(set, req.user)) {
    return res.status(403).json({ message: 'You can only edit your own sets' });
  }
  if (set.status === 'approved' && req.user.role !== 'admin') {
    return res
      .status(409)
      .json({ message: 'Approved sets are locked. Contact an admin to make changes.' });
  }
  if (set.status === 'approved' && req.user.role !== 'admin') {
    return res
      .status(409)
      .json({ message: 'Approved sets are locked. Contact an admin to make changes.' });
  }

  ['title', 'description', 'category', 'difficulty', 'timeLimitMinutes'].forEach((field) => {
    if (req.body[field] !== undefined) {
      set[field] = req.body[field];
    }
  });

  await set.save();
  res.json(set);
});

const publishQuestionSet = asyncHandler(async (req, res) => {
  const set = await QuestionSet.findById(req.params.id);
  if (!set) {
    return res.status(404).json({ message: 'Question set not found' });
  }
  if (!isOwnerOrAdmin(set, req.user)) {
    return res.status(403).json({ message: 'You can only publish your own sets' });
  }

  const questionCount = await Question.countDocuments({ questionSet: set._id });
  if (!questionCount) {
    return res
      .status(400)
      .json({ message: 'Add at least one question before publishing this set' });
  }

  set.status = 'pending';
  await set.save();
  res.json({ message: 'Question set submitted for admin approval', set });
});

const deleteQuestionSet = asyncHandler(async (req, res) => {
  const set = await QuestionSet.findById(req.params.id);

  if (!set) {
    return res.status(404).json({ message: 'Question set not found' });
  }

  if (!isOwnerOrAdmin(set, req.user)) {
    return res.status(403).json({ message: 'You can only delete your own sets' });
  }

  await Question.deleteMany({ questionSet: set._id });
  await Submission.deleteMany({ questionSet: set._id });
  await set.deleteOne();

  res.json({ message: 'Question set deleted' });
});

module.exports = {
  createQuestionSet,
  getQuestionSets,
  getQuestionSetById,
  updateQuestionSet,
  publishQuestionSet,
  deleteQuestionSet,
};
