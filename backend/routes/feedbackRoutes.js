const express = require('express');
const router = express.Router();
const Sentiment = require('sentiment');
const Feedback = require('../models/Feedback');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/authMiddleware');

const sentiment = new Sentiment();

// Clear all feedbacks (Admin)
router.delete('/clear', authenticate, isAdmin, async (req, res) => {
  try {
    const { deletedCount } = await Feedback.deleteMany({});
    res.json({ success: true, message: 'All cleared!', deletedCount });
  } catch (err) {
    console.error('DELETE /clear:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit feedback
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, product, message } = req.body;
    if (!message?.trim() || !product)
      return res.status(400).json({ error: 'Message and Product required' });

    const result = sentiment.analyze(message);
    const sentimentLabel = result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral';

    const fb = await Feedback.create({
      user_id: req.user?._id || 'anonymous',
      name: req.user?.name || name || 'Guest',
      email: req.user?.email || email,
      product,
      message: message.trim(),
      sentiment: sentimentLabel,
      score: result.score,
    });

    res.status(201).json({ 
      success: true, 
      sentiment: sentimentLabel,    
      score: result.score,          
      message: 'Feedback submitted!', 
      feedback: fb 
    });
  } catch (err) {
    console.error('POST /feedback:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User’s summary
router.get('/my-summary', authenticate, async (req, res) => {
  try {
    const uid = req.user._id;
    const sentiments = ['Positive', 'Negative', 'Neutral'];
    const counts = await Promise.all(sentiments.map(s => Feedback.countDocuments({ user_id: uid, sentiment: s })));
    res.json({ total: counts.reduce((a, b) => a + b), positive: counts[0], negative: counts[1], neutral: counts[2] });
  } catch (err) {
    console.error('GET /my-summary:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Global summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const sentiments = ['Positive', 'Negative', 'Neutral'];
    const counts = await Promise.all(sentiments.map(s => Feedback.countDocuments({ sentiment: s })));
    const total = counts.reduce((a, b) => a + b);
    res.json({ total, positive: counts[0], negative: counts[1], neutral: counts[2] });
  } catch (err) {
    console.error('GET /summary:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User’s feedback list
router.get('/my-feedbacks', authenticate, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user_id: req.user._id }).sort({ timestamp: -1 });
    res.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err) {
    console.error('GET /my-feedbacks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete one feedback (Admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, message: 'Deleted!' });
  } catch (err) {
    console.error('DELETE /:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// All feedbacks (Admin)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 50;
    const [feedbacks, total] = await Promise.all([
      Feedback.find().sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit),
      Feedback.countDocuments()
    ]);
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), feedbacks });
  } catch (err) {
    console.error('GET /feedback:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update feedback (Admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const msg = req.body.message?.trim();
    if (!msg) return res.status(400).json({ error: 'Message required' });
    const result = sentiment.analyze(msg);
    const sentimentLabel = result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral';

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { message: msg, sentiment: sentimentLabel, score: result.score },
      { new: true }
    );

    if (!feedback) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, message: 'Updated!', feedback });
  } catch (err) {
    console.error('PUT /:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
