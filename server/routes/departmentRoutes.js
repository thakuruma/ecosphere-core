const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, getDepartments);
router.post('/', requireAuth, requireRole('Admin'), createDepartment);

module.exports = router;
