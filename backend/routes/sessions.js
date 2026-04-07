const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');

// @route   GET api/sessions
// @desc    Get all sessions for the logged in user with auto-expiry check
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'Tutor' 
      ? { tutorId: req.user.id } 
      : { learnerId: req.user.id };

    let sessions = await Session.find(query).populate('learnerId tutorId', ['fullName', 'profilePhoto', 'personalEmail']);

    const now = new Date();
    const threeHoursInMs = 3 * 60 * 60 * 1000;

    // Auto-expiry logic: If Confirmed and now > schedule + 3 hours, mark as Expired
    let sessionsToUpdate = sessions.filter(s => 
      s.status === 'Confirmed' && (now - new Date(s.schedule)) > threeHoursInMs
    );

    if (sessionsToUpdate.length > 0) {
      const updatePromises = sessionsToUpdate.map(s => {
        s.status = 'Expired';
        return s.save();
      });
      await Promise.all(updatePromises);
      // Re-fetch or just update local list
      sessions = await Session.find(query).populate('learnerId tutorId', ['fullName', 'profilePhoto', 'personalEmail']);
    }

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/sessions/:id/complete
// @desc    Mark session as completed
// @access  Private (Tutor only)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Tutor') {
      return res.status(403).json({ msg: 'Only tutors can mark sessions as completed' });
    }

    let session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    if (session.tutorId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    session.status = 'Completed';
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
