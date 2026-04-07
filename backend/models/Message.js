const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String }, // For text messages
  messageType: { type: String, enum: ['text', 'file'], default: 'text' },
  fileUrl: { type: String },
  fileName: { type: String },
  fileType: { type: String },
  readStatus: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
