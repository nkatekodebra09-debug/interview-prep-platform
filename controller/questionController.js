const Question = require('../models/Question');

const createQuestion = async (req, res) => {
  try {
    const { text, type, options, correctAnswer } = req.body;

    const question = await Question.create({
      text,
      type,
      options,
      correctAnswer,
      createdBy: req.user.id
    });

    return res.status(201).json(question);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createQuestion, getQuestions };
