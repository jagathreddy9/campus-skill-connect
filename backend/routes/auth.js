const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Force-add collegeName to schema at runtime to bypass any stale model issues
if (!User.schema.path('collegeName')) {
  User.schema.add({ collegeName: String });
}

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  // Proactive connection check
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      msg: '🚨 Database Unavailable: The system cannot reach the database cluster. Please verify your Atlas Network Access (IP Whitelist).' 
    });
  }

  try {
    const { role, fullName, collegeEmail, personalEmail, password, phone, gender, age, pursuingYear, course, skills } = req.body;

    // Password regex: 8 to 16 chars, at least one letter and one number
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ msg: 'Password must be 8 to 16 characters long and include at least one letter and one number.' });
    }

    // Check college email explicitly for format you@collegeName.ac.in
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.ac\.in$/;
    if (!emailRegex.test(collegeEmail)) {
      return res.status(400).json({ msg: 'Please use a valid college email in the format: you@collegeName.ac.in' });
    }

    let user = await User.findOne({ collegeEmail });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    if (personalEmail) {
      let checkPE = await User.findOne({ personalEmail });
      if (checkPE) {
        return res.status(400).json({ msg: 'Personal email is already registered to another account' });
      }
    }

    if (phone) {
      let checkPhone = await User.findOne({ phone });
      if (checkPhone) {
        return res.status(400).json({ msg: 'Phone number is already registered to another account' });
      }
    }

    // Auto-extract college name from email (e.g., student@mits.ac.in -> MITS)
    const domainPart = collegeEmail.split('@')[1];
    const extractedCollege = domainPart.split('.')[0].toUpperCase();

    user = new User({
      role, 
      fullName, 
      collegeEmail, 
      personalEmail, 
      password, 
      phone, 
      gender, 
      age, 
      pursuingYear, 
      course, 
      skills,
      collegeName: extractedCollege // Auto-filled
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Login user immediately after registration
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      const responseUser = { 
        id: user.id, 
        fullName: user.fullName, 
        role: user.role, 
        profilePhoto: user.profilePhoto, 
        isProfileComplete: user.isProfileComplete, 
        collegeName: user.collegeName,
        collegeEmail: user.collegeEmail
      };
      console.log("[DEBUG] Registration successful, returning user:", responseUser);
      res.json({ token, user: responseUser });
    });

  } catch (err) {
    console.error('Registration error:', err.name, err.message);
    const dbErrors = ['MongooseServerSelectionError', 'MongoNetworkError', 'MongoTimeoutError', 'MongoServerError'];
    if (dbErrors.includes(err.name) || err.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        msg: '🚨 Database Connection Error: Please verify your Atlas Cluster IP Whitelist and network connectivity.' 
      });
    }
    res.status(500).json({ msg: 'An internal server error occurred during registration.' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  // Proactive connection check
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      msg: '🚨 Database Connection Error: Please ensure your environment has access to the Atlas Cluster in the Network Access panel.' 
    });
  }

  try {
    const { collegeEmail, password, role } = req.body;

    let user = await User.findOne({ collegeEmail });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Role-based separation check
    if (user.role !== role) {
      return res.status(400).json({ msg: `Access Denied: This account is registered as a ${user.role}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, fullName: user.fullName, role: user.role, profilePhoto: user.profilePhoto, isProfileComplete: user.isProfileComplete, collegeName: user.collegeName } });
    });
  } catch (err) {
    console.error('Login error:', err.name, err.message);
    const dbErrors = ['MongooseServerSelectionError', 'MongoNetworkError', 'MongoTimeoutError', 'MongoServerError'];
    if (dbErrors.includes(err.name) || err.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        msg: '🚨 Database Unavailable: Please ensure your environment is authorized in the Atlas Network Access panel.' 
      });
    }
    res.status(500).json({ msg: 'An internal server error occurred during login.' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
