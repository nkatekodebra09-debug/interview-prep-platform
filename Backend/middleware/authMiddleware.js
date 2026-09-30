const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

      if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }

      if (user.isBlocked) {
        return res.status(403).json({ message: 'Account blocked by admin' });
      }

      if (!user.isApproved) {
        return res.status(403).json({ message: 'Account pending admin approval' });
      }

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions for this resource' });
      }

      req.user = {
        id: user._id.toString(),
        role: user.role,
        username: user.username,
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ message: 'Server error during authentication' });
    }
  };
};

module.exports = { protect };
