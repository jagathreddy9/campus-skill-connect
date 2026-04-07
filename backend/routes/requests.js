const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DemoRequest = require('../models/DemoRequest');
const Session = require('../models/Session');

// @route   POST api/requests
// @desc    Create a demo request
// @access  Private (Learner only)
router.post('/', auth, async (req, res) => {
  try {
    const { tutorId, skill, description, requestedTime } = req.body;

    const newRequest = new DemoRequest({
      learnerId: req.user.id,
      tutorId,
      skill,
      description,
      requestedTime
    });

    const request = await newRequest.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/requests
// @desc    Get all requests for the logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Depending on role, get relevant requests
    const query = req.user.role === 'Tutor' 
      ? { tutorId: req.user.id } 
      : { learnerId: req.user.id };

    let requests = await DemoRequest.find(query).populate('learnerId tutorId', ['fullName', 'profilePhoto', 'personalEmail']);

    const now = new Date();
    // Auto-expiry for pending requests past their date
    let requestsToUpdate = requests.filter(r => 
      r.status === 'Pending' && r.requestedTime && new Date(r.requestedTime) < now
    );

    if (requestsToUpdate.length > 0) {
      await DemoRequest.updateMany(
        { _id: { $in: requestsToUpdate.map(r => r._id) } },
        { $set: { status: 'Expired' } }
      );
      requests = await DemoRequest.find(query).populate('learnerId tutorId', ['fullName', 'profilePhoto', 'personalEmail']);
    }

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/requests/:id
// @desc    Update request status (Accept/Reject)
// @access  Private (Tutor only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, scheduledTime } = req.body;
    let request = await DemoRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ msg: 'Request not found' });

    // Make sure user owns request
    if (request.tutorId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    request.status = status;
    if (scheduledTime) request.scheduledTime = scheduledTime;

    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/requests/:id/session
// @desc    Create session after price negotiation
// @access  Private (Can be initiated by tutor or learner)
router.post('/:id/session', auth, async (req, res) => {
  try {
    const { agreedPrice, schedule } = req.body;
    const request = await DemoRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.status !== 'Accepted') return res.status(400).json({ msg: 'Demo must be accepted first' });

    const newSession = new Session({
      learnerId: request.learnerId,
      tutorId: request.tutorId,
      demoId: request._id,
      agreedPrice,
      schedule
    });

    const session = await newSession.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
