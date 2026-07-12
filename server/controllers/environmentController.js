console.log("Environment Controller Loaded");
const pool = require('../config/db');

async function getEmissionFactors(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        activity_name,
        unit,
        co2_per_unit,
        created_at
      FROM emission_factors
      ORDER BY activity_name;
    `);

    return res.status(200).json(result.rows);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Failed to fetch emission factors"
    });
  }
}

async function createEmissionFactor(req, res) {
  try {
    const { activity_name, unit, co2_per_unit } = req.body;

    // Validation
    if (!activity_name || !unit || co2_per_unit == null) {
      return res.status(400).json({
        error: "activity_name, unit and co2_per_unit are required"
      });
    }

    if (co2_per_unit <= 0) {
      return res.status(400).json({
        error: "co2_per_unit must be greater than 0"
      });
    }

    // Duplicate Check
    const existing = await pool.query(
      `SELECT id FROM emission_factors
       WHERE activity_name = $1 AND unit = $2`,
      [activity_name, unit]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Emission factor already exists"
      });
    }

    // Insert
    const result = await pool.query(
      `INSERT INTO emission_factors
      (activity_name, unit, co2_per_unit)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [activity_name, unit, co2_per_unit]
    );

    return res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Failed to create emission factor"
    });
  }
}
module.exports = {
  getEmissionFactors,
  createEmissionFactor
};