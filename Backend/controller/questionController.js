const Question = require('../models/Question');
const QuestionSet = require('../models/QuestionSet');
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

  const { error } = await loadSetForEditing(questionSet, req.user);
  if (error) {
    return res.status(error.code).json({ message: error.message });
  }

  const question = await Question.create({
    questionSet,
    text,
    type,
    options,
    correctAnswer,
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

  ['text', 'type', 'options', 'correctAnswer'].forEach(field => {
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

  await question.deleteOne();
  res.json({ message: 'Question deleted successfully' });
});

module.exports = { createQuestion, updateQuestion, deleteQuestion };

