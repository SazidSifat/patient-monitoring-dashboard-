const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketService = require('./services/socketService');
const sensorService = require('./services/sensorService');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());

// Initialize services
socketService.init(server);
sensorService.init();

// API Endpoint for ESP32 to send data
app.post('/api/sensors', (req, res) => {
  try {
    const data = req.body;
    const updatedData = sensorService.handleIncomingData(data);
    res.status(200).json({ status: 'success', data: updatedData });
  } catch (error) {
    if (error.message === 'No data provided') {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    console.error('Error processing sensor data:', error);
    res.status(500).json({ status: 'error', message: 'Failed to process sensor data' });
  }
});

// API Endpoint to fetch latest sensor data
app.get('/api/sensors', (req, res) => {
  try {
    const latestData = sensorService.getLatestData();
    console.log('GET /api/sensors - Sending:', latestData);
    res.json(latestData);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch sensor data' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Patient Monitor Server Started`);
  console.log(`========================================`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/sensors`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  console.log(`========================================\n`);
});
