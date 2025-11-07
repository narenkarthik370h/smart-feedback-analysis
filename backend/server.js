const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// CORS Configuration for Production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart Feedback API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartFeedback')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1); // Exit if DB connection fails
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({  message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});