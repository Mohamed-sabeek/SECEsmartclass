const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { logTabSwitch, getSessionEngagement } = require('../controllers/engagementController');

router.use(protect);

router.post('/tab-switch', logTabSwitch);
router.get('/session/:sessionId', getSessionEngagement);

module.exports = router;
