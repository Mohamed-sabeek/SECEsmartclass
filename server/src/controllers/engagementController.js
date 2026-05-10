const Engagement = require('../models/Engagement');
const asyncHandler = require('../utils/asyncHandler');

// @desc Log a tab switch event
// @route POST /api/engagement/tab-switch
// @access Private (Student)
const logTabSwitch = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const studentId = req.user.id;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID is required' });
  }

  // Find or create engagement record
  const engagement = await Engagement.findOneAndUpdate(
    { studentId, sessionId },
    { 
      $inc: { tabSwitchCount: 1 },
      $set: { lastSwitchTime: new Date() }
    },
    { upsert: true, new: true }
  );

  res.status(200).json({ 
    success: true, 
    data: {
      tabSwitchCount: engagement.tabSwitchCount,
      lastSwitchTime: engagement.lastSwitchTime
    }
  });
});

// @desc Get engagement stats for a session
// @route GET /api/engagement/session/:sessionId
// @access Private (Teacher)
const getSessionEngagement = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const engagements = await Engagement.find({ sessionId })
    .select('studentId tabSwitchCount lastSwitchTime');

  res.status(200).json({ 
    success: true, 
    data: engagements 
  });
});

module.exports = {
  logTabSwitch,
  getSessionEngagement
};
