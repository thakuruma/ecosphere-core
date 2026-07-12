const express = require('express');
const router = express.Router();
const {
  getEmissionFactors,
  createEmissionFactor,
  createCarbonTransaction,
  getCarbonTransactions,
  getEmissionsSummary,
} = require('../controllers/carbonController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/emission-factors', requireAuth, getEmissionFactors);
router.post('/emission-factors', requireAuth, requireRole('Admin', 'Manager'), createEmissionFactor);
router.post('/carbon-transactions', requireAuth, createCarbonTransaction);
router.get('/carbon-transactions', requireAuth, getCarbonTransactions);
router.get('/dashboard/emissions-summary', requireAuth, getEmissionsSummary);

module.exports = router;