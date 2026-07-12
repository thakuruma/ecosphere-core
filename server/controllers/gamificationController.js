const pool = require('../config/db');

// Shared helper — call this any time an employee's XP changes
async function checkAndAwardBadges(employeeId) {
  const empResult = await pool.query('SELECT xp_points FROM employees WHERE id = $1', [employeeId]);
  if (empResult.rows.length === 0) return;
  const xp = empResult.rows[0].xp_points;

  const eligibleBadges = await pool.query(
    `SELECT b.id FROM badges b
     WHERE b.unlock_xp_threshold <= $1
     AND b.id NOT IN (SELECT badge_id FROM employee_badges WHERE employee_id = $2)`,
    [xp, employeeId]
  );

  for (const badge of eligibleBadges.rows) {
    await pool.query(
      'INSERT INTO employee_badges (employee_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [employeeId, badge.id]
    );
  }
}

async function getBadges(req, res) {
  try {
    const result = await pool.query('SELECT * FROM badges ORDER BY unlock_xp_threshold');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch badges' });
  }
}

async function getEmployeeBadges(req, res) {
  try {
    const result = await pool.query(
      `SELECT b.* FROM badges b
       JOIN employee_badges eb ON b.id = eb.badge_id
       WHERE eb.employee_id = $1 ORDER BY eb.unlocked_at DESC`,
      [req.params.id]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch employee badges' });
  }
}

async function getLeaderboard(req, res) {
  try {
    const result = await pool.query(
      `SELECT e.id, e.name, e.xp_points,
       (SELECT COUNT(*) FROM employee_badges eb WHERE eb.employee_id = e.id) AS badge_count
       FROM employees e ORDER BY e.xp_points DESC LIMIT 10`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

// Quick manual XP-award endpoint — useful for testing/demo without needing the CSR module finished
async function awardXp(req, res) {
  try {
    const { employee_id, points } = req.body;
    if (!employee_id || !points || points <= 0) {
      return res.status(400).json({ error: 'employee_id and a positive points value are required' });
    }
    await pool.query('UPDATE employees SET xp_points = xp_points + $1 WHERE id = $2', [points, employee_id]);
    await checkAndAwardBadges(employee_id);
    const updated = await pool.query('SELECT id, name, xp_points FROM employees WHERE id = $1', [employee_id]);
    return res.status(200).json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to award XP' });
  }
}

module.exports = { getBadges, getEmployeeBadges, getLeaderboard, awardXp, checkAndAwardBadges };