const express = require('express');
const app = express();

app.get('/api', (req, res) => {
  console.log('API endpoint hit!');
  res.json({ message: 'Simple test works!', time: new Date().toISOString() });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Simple test server on port ${PORT}`);
  console.log(`👉 Test: curl http://localhost:${PORT}/api`);
});