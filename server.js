const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let latestSensorData = null;

// Use environment variable for port (Render sets this automatically)
const PORT = process.env.PORT || 3000;
// Parse JSON bodies
app.use(bodyParser.json());

// Serve frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Receive data from ESP32
app.post('/sensor-data', (req, res) => {
  const data = req.body;
  console.log('Received from ESP32:', data);

  // Emit to frontend via Socket.IO
  io.emit('sensorUpdate', data);
  latestSensorData = data;
  res.status(200).send('Data received');
});

app.get('/live-data', (req, res) => {
  if (!latestSensorData) {
    return res.status(200).json({ data: null, message: 'No live data yet' });
  }
  res.status(200).json({ data: latestSensorData });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});