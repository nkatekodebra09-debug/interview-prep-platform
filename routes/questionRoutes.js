const express = require('express');
const { createQuestion, getQuestions } = require('../controller/questionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect(['student', 'instructor', 'admin']), createQuestion);
router.get('/', protect(['student', 'instructor', 'admin']), getQuestions);

module.exports = router;