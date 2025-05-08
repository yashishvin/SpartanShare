// backend/server.js

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

const http = require('http');
const { Server } = require('socket.io');

// Load env vars
dotenv.config();

// Initialize Express
const app = express();

// Create HTTP server & bind Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://13.52.246.199',
      'http://localhost:3001'
    ],
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// CORS options
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://13.52.246.199'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

// API routes
const authRoutes = require('./routes/api/auth');
const fileRoutes = require('./routes/api/files');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// -----------------------------------------------------------------------------
// Watch Party Signaling with Socket.io
// -----------------------------------------------------------------------------

// In-memory rooms map: roomName -> array of socket IDs
const rooms = {};

io.on('connection', (socket) => {
  console.log(`📡 Socket connected: ${socket.id}`);

  // Join a room
  socket.on('join-room', ({ roomName, userName }) => {
    rooms[roomName] = rooms[roomName] || [];

    // Send existing user list to the newcomer
    const existing = rooms[roomName].filter(id => id !== socket.id);
    socket.emit('all-users', existing);

    // Add this socket to the room
    rooms[roomName].push(socket.id);
  });

  // Caller sends a WebRTC offer to a specific peer
  socket.on('sending-signal', (payload) => {
    io.to(payload.userToSignal).emit('user-joined', payload);
  });

  // Callee returns their WebRTC answer
  socket.on('returning-signal', (payload) => {
    io.to(payload.callerId).emit('receiving-returned-signal', {
      signal: payload.signal,
      id: socket.id
    });
  });

  // Chat message broadcast
  socket.on('chat-message', (message) => {
    socket.broadcast.emit('chat-message', message);
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    for (const room of Object.keys(rooms)) {
      rooms[room] = rooms[room].filter(id => id !== socket.id);
      // Optionally, notify remaining users
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// -----------------------------------------------------------------------------
// Error handler
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});

// Start combined HTTP + WebSocket server
const PORT = process.env.PORT || 5001 || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend + Socket.io listening on port ${PORT}`);
});
