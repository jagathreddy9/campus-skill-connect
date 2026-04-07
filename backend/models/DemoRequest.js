const mongoose = require('mongoose');

const DemoRequestSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  description: { type: String, required: true },
  requestedTime: { type: Date }, // time preferences from learner
  scheduledTime: { type: Date }, // time assigned by tutor on accept
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Expired'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('DemoRequest', DemoRequestSchema);
