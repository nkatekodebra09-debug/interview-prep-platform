const express = require('express');
const {
  getAllUsers,
  approveUser,
  setBlocked,
  deleteUser,
  getSetsForReview,
  reviewSet,
  getAnalytics,
} = require('../controller/adminController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect(['admin']));

router.get('/users', getAllUsers);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/block', setBlocked);
router.delete('/users/:id', deleteUser);

router.get('/question-sets', getSetsForReview);
router.patch('/question-sets/:id/status', reviewSet);

router.get('/analytics', getAnalytics);

module.exports = router;
