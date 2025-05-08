const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');


// Load env vars
dotenv.config();

const authRoutes = require('./routes/api/auth');
const fileRoutes = require('./routes/api/files');

// Connect to database
connectDB();

// Initialize app
const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000','https://13.52.246.199'], // Allow both localhost variations
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Configure CORS more explicitly
app.use(cors( corsOptions));

// Body parser middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
// Add more routes here

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});


// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));