const pool = require('../config/db');

async function getDepartments(req, res) {
  try {
    const result = await pool.query(
      `SELECT d.id, d.name, d.code, d.status, e.name AS head_name
       FROM departments d
       LEFT JOIN employees e ON d.head_employee_id = e.id
       ORDER BY d.name`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

async function createDepartment(req, res) {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const existing = await pool.query(
      'SELECT id FROM departments WHERE name = $1 OR code = $2',
      [name, code]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A department with this name or code already exists' });
    }

    const result = await pool.query(
      'INSERT INTO departments (name, code) VALUES ($1, $2) RETURNING *',
      [name, code]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create department' });
  }
}

module.exports = { getDepartments, createDepartment };
