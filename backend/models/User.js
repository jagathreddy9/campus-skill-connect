const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ['Learner', 'Tutor', 'Admin'], required: true },
  isProfileComplete: { type: Boolean, default: false },
  fullName: { type: String, required: true },
  collegeName: { type: String },
  collegeEmail: { type: String, required: true, unique: true },
  personalEmail: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true }, 
  gender: { type: String },
  age: { type: Number },
  pursuingYear: { type: String },
  course: { type: String },
  profilePhoto: { type: String }, // Local file path or base64
  
  // Tutor Specific Fields
  skills: { type: [String], default: [] },
  availability: { type: String }, // e.g. "Weekends 10AM-12PM"
  experience: { type: String },
  education: { type: String },
  relatedProjects: { type: [String], default: [] },
  ratings: [{
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, required: true },
    review: { type: String }
  }],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

// Learner not visible to see tutors phone number in the UI - this will be handled in the API response omitting the phone property

module.exports = mongoose.model('User', UserSchema);
