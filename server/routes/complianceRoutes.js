const express = require('express');
const router = express.Router();
const { getComplianceIssues, createComplianceIssue, closeComplianceIssue } = require('../controllers/complianceController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, getComplianceIssues);
router.post('/', requireAuth, requireRole('Admin', 'Manager'), createComplianceIssue);
router.patch('/:id/close', requireAuth, closeComplianceIssue);

module.exports = router;