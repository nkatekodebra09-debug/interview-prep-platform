const Question = require('../models/Question');
const QuestionSet = require('../models/questionSet');
const asyncHandler = require('../middleware/asyncHandler');

async function loadSetForEditing(setId, user) {
  const set = await QuestionSet.findById(setId);
  if (!set) {
    return { error: { code: 404, message: 'Question set not found' } };
  }
  if (user.role !== 'admin' && set.createdBy.toString() !== user.id) {
    return { error: { code: 403, message: 'You can only edit your own sets' } };
  }
  return { set };
}

const createQuestion = asyncHandler(async (req, res) => {
  const { questionSet, text, type, options, correctAnswer } = req.body;

  if (!String(text || '').trim() || !['mcq', 'descriptive'].includes(type)) {
    return res
      .status(400)
      .json({ message: 'Question text and a valid question type are required' });
  }
  if (String(text).trim().length > 2000) {
    return res.status(400).json({ message: 'Question text must be 2000 characters or fewer' });
  }
  const normalizedOptions = Array.isArray(options)
    ? options.map((option) => String(option).trim()).filter(Boolean)
    : [];
  if (type === 'mcq' && (normalizedOptions.length < 2 || !String(correctAnswer || '').trim())) {
    return res.status(400).json({
      message: 'Multiple-choice questions need at least two options and a correct answer',
    });
  }
  if (
    type === 'mcq' &&
    !normalizedOptions.some(
      (option) => option.toLowerCase() === String(correctAnswer).trim().toLowerCase(),
    )
  ) {
    return res.status(400).json({ message: 'Correct answer must match one of the answer choices' });
  }
  if (normalizedOptions.some((option) => option.length > 500)) {
    return res.status(400).json({ message: 'Each answer choice must be 500 characters or fewer' });
  }

  const { set, error } = await loadSetForEditing(questionSet, req.user);
  if (error) return res.status(error.code).json({ message: error.message });
  if (set.status === 'approved' && req.user.role !== 'admin') {
    return res
      .status(409)
      .json({ message: 'Approved sets are locked. Contact an admin to make changes.' });
  }

  const question = await Question.create({
    questionSet,
    text: String(text).trim(),
    type,
    options: type === 'mcq' ? normalizedOptions : [],
    correctAnswer: type === 'mcq' ? String(correctAnswer).trim() : 'Instructor review required',
    createdBy: req.user.id,
  });

  res.status(201).json(question);
});

const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }

  const { error } = await loadSetForEditing(question.questionSet, req.user);
  if (error) {
    return res.status(error.code).json({ message: error.message });
  }
  const set = await QuestionSet.findById(question.questionSet).select('status');
  if (set.status === 'approved' && req.user.role !== 'admin') {
    return res
      .status(409)
      .json({ message: 'Approved sets are locked. Contact an admin to make changes.' });
  }

  ['text', 'type', 'options', 'correctAnswer'].forEach((field) => {
    if (req.body[field] !== undefined) {
      question[field] = req.body[field];
    }
  });

  await question.save();
  res.json(question);
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }

  const { error } = await loadSetForEditing(question.questionSet, req.user);
  if (error) {
    return res.status(error.code).json({ message: error.message });
  }
  const set = await QuestionSet.findById(question.questionSet).select('status');
  if (set.status === 'approved' && req.user.role !== 'admin') {
    return res
      .status(409)
      .json({ message: 'Approved sets are locked. Contact an admin to make changes.' });
  }

  await question.deleteOne();
  res.json({ message: 'Question deleted successfully' });
});

module.exports = { createQuestion, updateQuestion, deleteQuestion };
