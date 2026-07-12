const express = require('express');
const router = express.Router();
const { getBadges, getEmployeeBadges, getLeaderboard, awardXp } = require('../controllers/gamificationController');
const { requireAuth } = require('../middleware/auth');

router.get('/badges', requireAuth, getBadges);
router.get('/employees/:id/badges', requireAuth, getEmployeeBadges);
router.get('/leaderboard', requireAuth, getLeaderboard);
router.post('/award-xp', requireAuth, awardXp);

module.exports = router;