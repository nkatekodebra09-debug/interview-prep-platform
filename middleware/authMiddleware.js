const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (roles = []) => (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized, no token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (roles.length > 0 && !roles.includes(decoded.role)) {
            return res.status(403).json({
                message: 'Access denied, you do not have permission to access this resource'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Not authorized, token failed'
        });
    }
};

module.exports = { protect };