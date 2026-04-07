const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

// @route   POST api/contact
// @desc    Send contact us email
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, description } = req.body;

    if (!name || !email || !description) {
      return res.status(400).json({ msg: 'Please provide name, email, and description' });
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Standard configuration for test purposes
      auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password'
      }
    });

    // Email Options
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER || 'support@campusskillconnect.com',
      subject: `Campus Skill Connect Contact: ${subject || 'New Inquiry'}`,
      text: `Name: ${name}\nEmail: ${email}\n\nDescription:\n${description}`
    };

    // Send email (In production this would actually send)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
    } else {
        console.log("Nodemailer simulated email sent:", mailOptions);
    }

    res.json({ msg: 'Thank you for reaching out! Your message has been received.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
