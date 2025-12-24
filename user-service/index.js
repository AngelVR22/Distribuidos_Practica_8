const express = require('express');
const app = express();
const port = 3002;

app.use(express.json());

let users = [];

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', (req, res) => {
  const user = { id: Date.now().toString(), ...req.body };
  users.push(user);
  res.status(201).json(user);
});

app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).send('User not found');
  }
  res.json(user);
});

app.delete('/users/:id', (req, res) => {
  users = users.filter(u => u.id !== req.params.id);
  res.status(204).send();
});

const PORT = process.env.PORT || port;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`User service running on port ${PORT}`);
});

