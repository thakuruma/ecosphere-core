const express = require('express');
const router = express.Router();
const { getEmployees, updateEmployeeRole } = require('../controllers/employeeController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, getEmployees);
router.patch('/:id/role', requireAuth, requireRole('Admin'), updateEmployeeRole);

module.exports = router;
