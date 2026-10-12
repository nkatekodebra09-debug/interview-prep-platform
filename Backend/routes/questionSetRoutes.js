const express = require('express');
const {
  createQuestionSet,
  getQuestionSets,
  getQuestionSetById,
  updateQuestionSet,
  publishQuestionSet,
  deleteQuestionSet,
} = require('../controller/questionSetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect(), getQuestionSets);
router.get('/:id', protect(), getQuestionSetById);
router.post('/', protect(['instructor', 'admin']), createQuestionSet);
router.patch('/:id/publish', protect(['instructor', 'admin']), publishQuestionSet);
router.put('/:id', protect(['instructor', 'admin']), updateQuestionSet);
router.delete('/:id', protect(['instructor', 'admin']), deleteQuestionSet);

module.exports = router;
