const express = require('express');
const cors = require('cors');
const path = require('path');

const decisionRoutes = require('./routes/decisionRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/decision', decisionRoutes);

// Health check (optional but clean)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

require('./repository/db');
console.log("Database initialized");
