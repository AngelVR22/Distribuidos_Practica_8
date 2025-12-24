const express = require('express');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(express.json());

let tasks = [];

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).send('Task not found');
  }
  res.json(task);
});

app.post('/tasks', async (req, res) => {
  try {
    const task = { id: Date.now().toString(), ...req.body };
    
    // Si se asignó un equipo, obtener información del equipo
    if (task.teamId) {
      try {
        const teamResponse = await axios.get(`http://team-service:3004/teams/${task.teamId}`);
        task.teamName = teamResponse.data.name;
      } catch (error) {
        // Si el equipo no existe, continuar sin el nombre
        task.teamName = 'Equipo no encontrado';
      }
    }
    
    tasks.push(task);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tarea: ' + error.message });
  }
});

app.put('/tasks/:id', (req, res) => {
  let task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).send('Task not found');
  }
  task = { ...task, ...req.body };
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== req.params.id);
  res.status(204).send();
});

const PORT = process.env.PORT || port;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Task service running on port ${PORT}`);
});

