const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getAllUsers, deleteUser, blockUser } = require('../controller/adminController');

const router = express.Router();

router.get('/users', protect(['admin']), getAllUsers);
router.delete('/users/:id', protect(['admin']), deleteUser);
router.patch('/users/:id', protect(['admin']), blockUser);

module.exports = router;