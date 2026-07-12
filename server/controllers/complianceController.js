const pool = require('../config/db');

async function getComplianceIssues(req, res) {
  try {
    const { status } = req.query;
    const values = [];
    let whereClause = '';
    if (status) {
      values.push(status);
      whereClause = 'WHERE ci.status = $1';
    }
    const result = await pool.query(
      `SELECT ci.*, e.name AS owner_name,
       (ci.status = 'Open' AND ci.due_date < CURRENT_DATE) AS is_overdue
       FROM compliance_issues ci
       JOIN employees e ON ci.owner_id = e.id
       ${whereClause} ORDER BY ci.due_date ASC`,
      values
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch compliance issues' });
  }
}

async function createComplianceIssue(req, res) {
  try {
    const { title, description, owner_id, due_date } = req.body;
    if (!title || !owner_id || !due_date) {
      return res.status(400).json({ error: 'title, owner_id, and due_date are required' });
    }
    const ownerCheck = await pool.query('SELECT id FROM employees WHERE id = $1', [owner_id]);
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Owner (employee) not found' });
    }
    const result = await pool.query(
      'INSERT INTO compliance_issues (title, description, owner_id, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description || null, owner_id, due_date]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create compliance issue' });
  }
}

async function closeComplianceIssue(req, res) {
  try {
    const result = await pool.query(
      "UPDATE compliance_issues SET status = 'Closed' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compliance issue not found' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to close compliance issue' });
  }
}

module.exports = { getComplianceIssues, createComplianceIssue, closeComplianceIssue };