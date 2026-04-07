const dns = require('dns');
// Fix for ECONNREFUSED issues with MongoDB Atlas SRV records in some environments
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection with retry logic and optimized options
const connectDB = async () => {
    const options = {
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 2000,
        retryWrites: true
    };

    try {
        await mongoose.connect(process.env.MONGO_URI, options);
        console.log('MongoDB connected successfully to cluster:', mongoose.connection.name);
    } catch (err) {
        console.error('MongoDB connection error. Name:', err.name, 'Message:', err.message);
        console.log('Retrying in 2 seconds...');
        setTimeout(connectDB, 2000);
    }
};

connectDB();

// Global handle for Mongoose buffering timeouts
mongoose.set('bufferCommands', false); // Disable buffering so errors are immediate rather than waiting 10s

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/sessions', require('./routes/sessions'));

// Health Check Route
app.get('/api/health', (req, res) => {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.json({
    status: 'Server is running',
    database: states[mongoose.connection.readyState],
    dbName: mongoose.connection.name
  });
});

// TEMPORARY: Reset Database Route (Delete after use)
app.get('/api/reset-database', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
        res.send("<h1>Database Reset Successful!</h1><p>All data has been cleared from Atlas. You can now register fresh users.</p>");
    } catch (err) {
        res.status(500).send("Reset Failed: " + err.message);
    }
});

// Socket.io for Real-Time Chat
io.on('connection', (socket) => {
  console.log('New client connected: ', socket.id);

  // User joins their personal room to receive messages
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle incoming messages
  socket.on('sendMessage', async (data) => {
    try {
      const Message = require('./models/Message');
      const { senderId, receiverId, content, messageType, fileUrl, fileName, fileType } = data;
      
      const msg = new Message({ 
        senderId, 
        receiverId, 
        content, 
        messageType: messageType || 'text',
        fileUrl, 
        fileName, 
        fileType 
      });
      await msg.save();
      
      const populatedMsg = await Message.findById(msg._id).populate('senderId receiverId', ['fullName', 'profilePhoto']);
      
      // Emit to receiver and sender
      io.to(receiverId).emit('receiveMessage', populatedMsg);
      io.to(senderId).emit('receiveMessage', populatedMsg);
    } catch (err) {
      console.error('Socket message error: ', err);
    }
  });

  // Mark message as read
  socket.on('markAsRead', async (data) => {
    try {
      const Message = require('./models/Message');
      const { messageId, senderId } = data;
      await Message.findByIdAndUpdate(messageId, { readStatus: true });
      // Notify the sender that the message was read
      io.to(senderId).emit('messageRead', { messageId });
    } catch (err) {
      console.error('Socket markAsRead error: ', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected: ', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// Global error handler - Ensures all errors are JSON
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]:', err.stack);
  res.status(500).json({ msg: 'An internal server error occurred. Please try again later.' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
