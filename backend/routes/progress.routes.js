const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const { upsertProgress, getProgress, getMemberAnalytics } = require('../controllers/progress.controller');

router.post('/', verifyToken, upsertProgress);
router.get('/:borrowingId', verifyToken, getProgress);
router.get('/analytics/member/:id', verifyToken, getMemberAnalytics);

module.exports = router; 