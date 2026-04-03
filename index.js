const express = require('express');
const registry = require('./mock-registry.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/registry', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Missing required query parameter: name' });
  }

  const entity = registry.find(
    (entry) => entry.name.toLowerCase() === name.toLowerCase()
  );

  if (!entity) {
    return res.status(404).json({ error: `Entity not found: ${name}` });
  }

  return res.json(entity);
});

app.listen(PORT, () => {
  console.log(`KYB Agent registry server running on port ${PORT}`);
});
