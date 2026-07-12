const pool = require('../config/db');

async function getEmissionFactors(req, res) {
  try {
    const result = await pool.query('SELECT * FROM emission_factors ORDER BY activity_name');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch emission factors' });
  }
}

async function createEmissionFactor(req, res) {
  try {
    const { activity_name, unit, co2_per_unit } = req.body;
    if (!activity_name || !unit || co2_per_unit === undefined) {
      return res.status(400).json({ error: 'activity_name, unit, and co2_per_unit are required' });
    }
    if (co2_per_unit < 0) {
      return res.status(400).json({ error: 'co2_per_unit cannot be negative' });
    }
    const result = await pool.query(
      'INSERT INTO emission_factors (activity_name, unit, co2_per_unit) VALUES ($1, $2, $3) RETURNING *',
      [activity_name, unit, co2_per_unit]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create emission factor' });
  }
}

async function createCarbonTransaction(req, res) {
  try {
    const { department_id, emission_factor_id, quantity, transaction_date } = req.body;

    if (!department_id || !emission_factor_id || !quantity || !transaction_date) {
      return res.status(400).json({ error: 'department_id, emission_factor_id, quantity, and transaction_date are required' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    if (new Date(transaction_date) > new Date()) {
      return res.status(400).json({ error: 'Transaction date cannot be in the future' });
    }

    // Server calculates CO2 — never trust a client-sent value
    const factorResult = await pool.query('SELECT co2_per_unit FROM emission_factors WHERE id = $1', [emission_factor_id]);
    if (factorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Emission factor not found' });
    }
    const co2Emitted = quantity * factorResult.rows[0].co2_per_unit;

    const result = await pool.query(
      `INSERT INTO carbon_transactions (department_id, emission_factor_id, quantity, co2_emitted, transaction_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [department_id, emission_factor_id, quantity, co2Emitted, transaction_date, req.user.id]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to log carbon transaction' });
  }
}

async function getCarbonTransactions(req, res) {
  try {
    const { department_id, from, to } = req.query;
    const conditions = [];
    const values = [];

    if (department_id) {
      values.push(department_id);
      conditions.push(`department_id = $${values.length}`);
    }
    if (from) {
      values.push(from);
      conditions.push(`transaction_date >= $${values.length}`);
    }
    if (to) {
      values.push(to);
      conditions.push(`transaction_date <= $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT ct.*, ef.activity_name, ef.unit
       FROM carbon_transactions ct
       JOIN emission_factors ef ON ct.emission_factor_id = ef.id
       ${whereClause} ORDER BY transaction_date DESC`,
      values
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch carbon transactions' });
  }
}

async function getEmissionsSummary(req, res) {
  try {
    const result = await pool.query(
      `SELECT d.name AS department, COALESCE(SUM(ct.co2_emitted), 0) AS total_co2
       FROM departments d
       LEFT JOIN carbon_transactions ct ON d.id = ct.department_id
       GROUP BY d.name ORDER BY total_co2 DESC`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch emissions summary' });
  }
}

module.exports = { getEmissionFactors, createEmissionFactor, createCarbonTransaction, getCarbonTransactions, getEmissionsSummary };