const express = require('express');
const axios = require('axios');
const app = express();
const port = 3003;

app.use(express.json());

let notifications = [];

app.get('/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/notifications', async (req, res) => {
  try {
    const notification = { 
      id: Date.now().toString(), 
      ...req.body,
      timestamp: new Date().toISOString()
    };
    
    // Si se asignó un equipo, obtener información del equipo y sus miembros
    if (notification.teamId) {
      try {
        const [teamResponse, membersResponse] = await Promise.all([
          axios.get(`http://team-service:3004/teams/${notification.teamId}`),
          axios.get(`http://team-service:3004/teams/${notification.teamId}/members`)
        ]);
        
        notification.teamName = teamResponse.data.name;
        notification.recipients = membersResponse.data.map(m => m.name).join(', ');
        notification.recipientCount = membersResponse.data.length;
      } catch (error) {
        notification.teamName = 'Equipo no encontrado';
        notification.recipients = 'N/A';
      }
    }
    
    notifications.push(notification);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear notificación: ' + error.message });
  }
});

app.get('/notifications/:id', (req, res) => {
  const notification = notifications.find(n => n.id === req.params.id);
  if (!notification) {
    return res.status(404).send('Notification not found');
  }
  res.json(notification);
});

app.delete('/notifications/:id', (req, res) => {
  notifications = notifications.filter(n => n.id !== req.params.id);
  res.status(204).send();
});

const PORT = process.env.PORT || port;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Notification service running on port ${PORT}`);
});
