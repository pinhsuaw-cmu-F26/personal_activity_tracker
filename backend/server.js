const path = require('node:path');
const http = require('node:http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.set('io', io);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/activities', activityRoutes);
app.get('/health', (request, response) => response.json({ status: 'ok' }));
app.get('*', (request, response) => response.sendFile(path.join(__dirname, '..', 'frontend', 'monitor.html')));

if (require.main === module) {
  server.listen(port, () => console.log(`Personal Activity Tracker running at http://localhost:${port}`));
}

module.exports = { app, server, io };
