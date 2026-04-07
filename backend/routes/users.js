const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');

// @route   GET api/users/tutors
// @desc    Get all tutors (search functionality)
// @access  Private
router.get('/tutors', auth, async (req, res) => {
  try {
    const { skill } = req.query;
    let query = { role: 'Tutor' };
    
    if (skill) {
      query.skills = { $regex: new RegExp(skill, 'i') };
    }

    // Exclude phone from response and other sensitive details if needed for list
    const tutors = await User.find(query).select('-password -phone');
    res.json(tutors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // If requester is learner and looking at tutor, hide phone until negotiation is done (or just always hide it in this route)
    const requester = await User.findById(req.user.id);
    if (requester.role === 'Learner' && user.role === 'Tutor') {
      user.phone = undefined; // Do not send phone
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/profile
// @desc    Update profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { skills, availability, experience, education, relatedProjects, ...rest } = req.body;
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Atomic update using $set to be 100% sure
    console.log("[DEBUG] Backend received body:", req.body);
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { 
        $set: {
          age: parseInt(req.body.age),
          pursuingYear: req.body.pursuingYear,
          course: req.body.course,
          personalEmail: req.body.personalEmail,
          collegeName: req.body.collegeName,
          skills: req.body.skills,
          availability: req.body.availability,
          experience: req.body.experience,
          isProfileComplete: true
        } 
      }, 
      { new: true, runValidators: false, strict: false }
    ).select('-password');

    console.log("[DEBUG] Database updated successfully. Document is now:", JSON.stringify(updatedUser));
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/uploadPhoto
// @desc    Upload profile photo
// @access  Private
router.post('/uploadPhoto', [auth, upload.single('profilePhoto')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    let user = await User.findById(req.user.id);
    user.profilePhoto = '/uploads/' + req.file.filename;
    await user.save();

    res.json({ profilePhoto: user.profilePhoto });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/:id/rate
// @desc    Rate a tutor
// @access  Private
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { score, review } = req.body;
    if (req.user.role !== 'Learner') {
      return res.status(403).json({ msg: 'Only learners can rate tutors' });
    }

    let tutor = await User.findById(req.params.id);
    if (!tutor || tutor.role !== 'Tutor') {
      return res.status(404).json({ msg: 'Tutor not found' });
    }

    // Check if learner already rated
    const existingIndex = tutor.ratings.findIndex(r => r.learnerId.toString() === req.user.id);
    if (existingIndex > -1) {
      tutor.ratings[existingIndex].score = score;
      tutor.ratings[existingIndex].review = review;
    } else {
      tutor.ratings.push({ learnerId: req.user.id, score, review });
    }

    // Recalculate average rating
    const totalScore = tutor.ratings.reduce((acc, curr) => acc + curr.score, 0);
    tutor.averageRating = totalScore / tutor.ratings.length;

    await tutor.save();
    res.json(tutor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
