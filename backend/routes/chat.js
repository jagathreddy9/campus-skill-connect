const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadChat = require('../middleware/chatUpload');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   GET api/chat/:userId
// @desc    Get chat history with a specific user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.id }
      ]
    }).sort({ createdAt: 1 }).populate('senderId receiverId', ['fullName', 'profilePhoto']);
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/chat/conversations/all
// @desc    Get all users the current user has chatted with
// @access  Private
router.get('/conversations/all', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    }).sort({ createdAt: -1 });

    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId.toString() !== req.user.id) userIds.add(msg.senderId.toString());
      if (msg.receiverId.toString() !== req.user.id) userIds.add(msg.receiverId.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('fullName profilePhoto role');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/chat/upload
// @desc    Upload a file for chat
// @access  Private
router.post('/upload', [auth, uploadChat.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const fileData = {
      fileUrl: '/uploads/chat/' + req.file.filename,
      fileName: req.file.originalname,
      fileType: req.file.mimetype
    };

    res.json(fileData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
