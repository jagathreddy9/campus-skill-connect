const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  demoId: { type: mongoose.Schema.Types.ObjectId, ref: 'DemoRequest' },
  agreedPrice: { type: Number, required: true },
  schedule: { type: Date, required: true },
  status: { type: String, enum: ['Confirmed', 'Completed', 'Expired', 'Cancelled'], default: 'Confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
