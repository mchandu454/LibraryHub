const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { upsertProgress, getProgress, getMemberAnalytics } = require('../controllers/progress.controller');

// All endpoints require authentication
router.post('/', authenticateToken, upsertProgress);
router.get('/:borrowingId', authenticateToken, getProgress);
router.get('/analytics/member/:id', authenticateToken, getMemberAnalytics);

module.exports = router; 