const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

function publicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved,
  };
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  const exists = await User.findOne({
    $or: [
      { email: String(email).toLowerCase() },
      { username: String(username) }
    ],
  });

  if (exists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const safeRole = role === 'instructor' ? 'instructor' : 'student';

  const user = await User.create({
    username,
    email,
    password,
    role: safeRole,
    isApproved: safeRole === 'student',
  });

  res.status(201).json({
    message: user.isApproved
      ? 'Registration successful'
      : 'Registration successful. Admin approval required for instructor accounts.',
    user: publicUser(user),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: 'Your account has been blocked' });
  }

  if (!user.isApproved) {
    return res.status(403).json({ message: 'Your account is awaiting admin approval' });
  }

  res.json({
    token: generateToken(user),
    user: publicUser(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(publicUser(user));
});

module.exports = { registerUser, loginUser, getMe };

