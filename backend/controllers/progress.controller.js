'use strict';
const db = require('../models');
const Progress = db.Progress;
const Borrowing = db.Borrowing;
const Book = db.Book;

// POST /api/progress
const upsertProgress = async (req, res) => {
  try {
    const { borrowingId, progress } = req.body;
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be 0-100.' });
    }
    // Check ownership
    const borrowing = await Borrowing.findByPk(borrowingId);
    if (!borrowing || borrowing.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Not your borrowing.' });
    }
    let record = await Progress.findOne({ where: { borrowingId } });
    if (record) {
      record.progress = progress;
      record.lastReadAt = new Date();
      await record.save();
    } else {
      record = await Progress.create({ borrowingId, progress, lastReadAt: new Date() });
    }
    res.status(200).json({ progress: record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/progress/:borrowingId
const getProgress = async (req, res) => {
  try {
    const { borrowingId } = req.params;
    const borrowing = await Borrowing.findByPk(borrowingId);
    if (!borrowing || borrowing.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Not your borrowing.' });
    }
    const record = await Progress.findOne({ where: { borrowingId } });
    if (!record) return res.status(404).json({ message: 'No progress found.' });
    res.status(200).json({ progress: record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/progress/analytics/member/:id
const getMemberAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own analytics.' });
    }
    // Find all borrowings for this user
    const borrowings = await Borrowing.findAll({ where: { userId: id } });
    const borrowingIds = borrowings.map(b => b.id);
    const progresses = await Progress.findAll({ where: { borrowingId: borrowingIds } });
    const avg = progresses.length ? (progresses.reduce((sum, p) => sum + p.progress, 0) / progresses.length) : 0;
    res.status(200).json({ average: avg, count: progresses.length, progresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { upsertProgress, getProgress, getMemberAnalytics }; 