require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
// Members B and D add their route imports here as they build them, e.g.:
// const carbonRoutes = require('./routes/carbonRoutes');
// const csrRoutes = require('./routes/csrRoutes');
// const badgeRoutes = require('./routes/badgeRoutes');
// const complianceRoutes = require('./routes/complianceRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
// app.use('/api/carbon-transactions', carbonRoutes);
// app.use('/api/csr-activities', csrRoutes);
// app.use('/api/badges', badgeRoutes);
// app.use('/api/compliance-issues', complianceRoutes);

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (safety net for anything not caught in controllers)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`EcoSphere server running on port ${PORT}`);
});
