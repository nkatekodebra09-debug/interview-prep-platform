const express = require('express');
const {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controller/questionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect(['instructor', 'admin']), createQuestion);
router.put('/:id', protect(['instructor', 'admin']), updateQuestion);
router.delete('/:id', protect(['instructor', 'admin']), deleteQuestion);

module.exports = router;
