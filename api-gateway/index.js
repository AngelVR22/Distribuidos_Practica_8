const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');

app.use(express.json());

// Configuración CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/api/tasks', (req, res) => {
  axios({ method: req.method, url: `http://task-service:3001/tasks${req.url}`, data: req.body })
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.use('/api/users', (req, res) => {
  axios({ method: req.method, url: `http://user-service:3002/users${req.url}`, data: req.body })
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.use('/api/notifications', (req, res) => {
  axios({ method: req.method, url: `http://notification-service:3003/notifications${req.url}`, data: req.body })
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.use('/api/teams', (req, res) => {
  axios({ method: req.method, url: `http://team-service:3004/teams${req.url}`, data: req.body })
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.listen(port, () => {
  console.log(`API Gateway running on http://localhost:${port}`);
});
