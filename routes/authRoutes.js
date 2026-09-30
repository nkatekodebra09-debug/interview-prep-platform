const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ username, email, password, role });

        return res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const jwtSecret = process.env.JWT_SECRET?.trim();
        const secret = jwtSecret || 'dev-secret-key-change-me';

        const token = jwt.sign(
            { id: user._id, role: user.role },
            secret,
            { expiresIn: '1d' }
        );

        return res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

    