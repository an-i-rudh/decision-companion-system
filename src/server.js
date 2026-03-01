const express = require('express');
const cors = require('cors');
const path = require('path');
const decisionRoutes = require('./routes/decisionRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/decision', decisionRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
