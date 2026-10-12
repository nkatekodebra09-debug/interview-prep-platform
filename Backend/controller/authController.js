const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
  const normalizedUsername = String(username || '').trim();
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();

  if (!normalizedUsername || !normalizedEmail || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  const exists = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (exists) {
    return res
      .status(409)
      .json({ message: 'That email address or username is already registered' });
  }

  const validRoles = ['student', 'instructor'];
  const safeRole = validRoles.includes(role) ? role : 'student';

  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    role: safeRole,
    isApproved: safeRole !== 'instructor',
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
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: 'Your account has been blocked' });
  }

  if (user.role === 'instructor' && !user.isApproved) {
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
