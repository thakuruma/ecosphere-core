const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

function generateToken(employee) {
  return jwt.sign(
    { id: employee.id, email: employee.email, role: employee.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

async function signup(req, res) {
  try {
    const { name, email, password, department_id } = req.body;

    // Basic validation — keep it explicit so it's easy to explain to judges
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await pool.query('SELECT id FROM employees WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Signup always creates a plain Employee — role escalation happens via
    // PATCH /api/employees/:id/role (Admin only), never at signup.
    const result = await pool.query(
      `INSERT INTO employees (name, email, password_hash, department_id, role)
       VALUES ($1, $2, $3, $4, 'Employee')
       RETURNING id, name, email, role, department_id, xp_points`,
      [name, email, passwordHash, department_id || null]
    );

    const employee = result.rows[0];
    const token = generateToken(employee);

    return res.status(201).json({ ...employee, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong during signup' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const employee = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, employee.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (employee.status === 'Inactive') {
      return res.status(403).json({ error: 'This account has been deactivated' });
    }

    const token = generateToken(employee);
    return res.status(200).json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department_id: employee.department_id,
      xp_points: employee.xp_points,
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong during login' });
  }
}

async function me(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, department_id, status, xp_points, created_at
       FROM employees WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { signup, login, me };
