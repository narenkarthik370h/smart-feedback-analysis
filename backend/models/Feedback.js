const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user_id: { type: String, default: null },
  name: { type: String, default: 'Guest' },
  email: { type: String, default: null },
  product: {                                   
    type: String, 
    required: true,
    enum: ['Website', 'Mobile App', 'Customer Service', 'Product Quality', 'Delivery', 'Other']
  },
  message: { type: String, required: true },
  sentiment: { type: String, enum: ['Positive', 'Negative', 'Neutral'], required: true },
  score: { type: Number },
  timestamp: { type: Date, default: Date.now }  
});

module.exports = mongoose.model('Feedback', FeedbackSchema);