const express = require('express');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect(['student']), async (req, res) => {
    const { question: questionId, answer } = req.body;
    const foundQuestion = await Question.findById(questionId);

    if (!foundQuestion) {
        return res.status(404).json({
            message: 'Question not found'
        });
    }

    let score = 0;
    if (foundQuestion.type === 'mcq' && foundQuestion.correctAnswer === answer) {
        score = 1;
    }

    const submission = await Submission.create({
        student: req.user.id,
        question: foundQuestion._id,
        answer,
        score
    });

    res.status(201).json(submission);
});

router.get('/', protect(['student', 'instructor', 'admin']), async (req, res) =>{
    const submission = await Submission.find({student: req.user.id}).populate('question')
    res.json(submission);
});

module.exports = router;