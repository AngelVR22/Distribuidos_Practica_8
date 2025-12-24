const express = require('express');
const axios = require('axios');
const app = express();
const port = 3004;

app.use(express.json());

let teams = [];

// Obtener todos los equipos
app.get('/teams', (req, res) => {
  res.json(teams);
});

// Crear un nuevo equipo
app.post('/teams', async (req, res) => {
  try {
    const { userIds, ...teamData } = req.body;
    const team = { 
      id: Date.now().toString(), 
      ...teamData,
      members: [] // Inicializar con array vacío de miembros
    };
    
    // Si se proporcionaron IDs de usuarios, agregarlos al equipo
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      for (const userId of userIds) {
        try {
          const userResponse = await axios.get(`http://user-service:3002/users/${userId}`);
          const user = userResponse.data;
          team.members.push({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          });
        } catch (error) {
          console.error(`Error al obtener usuario ${userId}:`, error.message);
        }
      }
    }
    
    teams.push(team);
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear equipo: ' + error.message });
  }
});

// Obtener un equipo específico
app.get('/teams/:id', (req, res) => {
  const team = teams.find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).send('Team not found');
  }
  res.json(team);
});

// Eliminar un equipo
app.delete('/teams/:id', (req, res) => {
  teams = teams.filter(t => t.id !== req.params.id);
  res.status(204).send();
});

// Obtener lista de usuarios disponibles desde user-service
app.get('/teams/:id/available-users', async (req, res) => {
  try {
    const response = await axios.get('http://user-service:3002/users');
    const team = teams.find(t => t.id === req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Filtrar usuarios que ya no están en el equipo
    const availableUsers = response.data.filter(
      user => !team.members.some(member => member.id === user.id)
    );
    
    res.json(availableUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios: ' + error.message });
  }
});

// Agregar un usuario al equipo
app.post('/teams/:id/members', async (req, res) => {
  try {
    const team = teams.find(t => t.id === req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Obtener información del usuario desde user-service
    const userResponse = await axios.get(`http://user-service:3002/users/${userId}`);
    const user = userResponse.data;

    // Verificar si el usuario ya está en el equipo
    if (team.members.some(m => m.id === userId)) {
      return res.status(400).json({ error: 'El usuario ya está en el equipo' });
    }

    // Agregar usuario al equipo
    team.members.push({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.status(201).json(team);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(500).json({ error: 'Error al agregar usuario: ' + error.message });
  }
});

// Obtener miembros de un equipo
app.get('/teams/:id/members', (req, res) => {
  const team = teams.find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  res.json(team.members || []);
});

// Eliminar un miembro del equipo
app.delete('/teams/:id/members/:userId', (req, res) => {
  const team = teams.find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  team.members = team.members.filter(m => m.id !== req.params.userId);
  res.status(200).json(team);
});

const PORT = process.env.PORT || port;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Team service running on port ${PORT}`);
});

