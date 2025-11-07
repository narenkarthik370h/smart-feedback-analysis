const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes); // 👈 NEW

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart Feedback API is running',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartFeedback', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`\n📊 API Endpoints:`);
  console.log(`\n🔐 Authentication:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/create-admin`);
  console.log(`\n💬 Feedback:`);
  console.log(`   - POST   http://localhost:${PORT}/api/feedback (Guest/User)`);
  console.log(`   - GET    http://localhost:${PORT}/api/feedback/summary (Authenticated)`);
  console.log(`   - GET    http://localhost:${PORT}/api/feedback/my-feedbacks (User)`);
  console.log(`   - GET    http://localhost:${PORT}/api/feedback (Admin)`);
  console.log(`   - PUT    http://localhost:${PORT}/api/feedback/:id (Admin)`);
  console.log(`   - DELETE http://localhost:${PORT}/api/feedback/:id (Admin)`);
  console.log(`   - DELETE http://localhost:${PORT}/api/feedback/clear (Admin)`);
});