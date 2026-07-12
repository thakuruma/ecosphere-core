const pool = require('../config/db');

async function getEmployees(req, res) {
  try {
    const { department_id, status } = req.query;
    const conditions = [];
    const values = [];

    if (department_id) {
      values.push(department_id);
      conditions.push(`department_id = $${values.length}`);
    }
    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT id, name, email, department_id, role, status, xp_points
       FROM employees ${whereClause} ORDER BY name`,
      values
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
}

async function updateEmployeeRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const allowedRoles = ['Admin', 'Manager', 'Employee'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${allowedRoles.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE employees SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update employee role' });
  }
}

module.exports = { getEmployees, updateEmployeeRole };
