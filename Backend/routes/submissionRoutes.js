const express = require('express');
const {
  submitAttempt,
  getMyAttempts,
  getAttemptById,
  getPerformance,
  getLeaderboard,
  getInstructorSubmissions,
  reviewSubmission,
} = require('../controller/submissionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect(['student']), submitAttempt);
router.get('/', protect(['student']), getMyAttempts);

router.get('/leaderboard', protect(), getLeaderboard);
router.get('/performance', protect(['instructor', 'admin']), getPerformance);
router.get('/review-queue', protect(['instructor', 'admin']), getInstructorSubmissions);
router.patch('/:id/review', protect(['instructor', 'admin']), reviewSubmission);

router.get('/:id', protect(['student']), getAttemptById);

module.exports = router;
