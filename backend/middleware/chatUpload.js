const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure chat uploads directory exists
const chatUploadDir = 'uploads/chat';
if (!fs.existsSync(chatUploadDir)){
    fs.mkdirSync(chatUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, chatUploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const uploadChat = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = uploadChat;
