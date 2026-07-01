const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketService = require('./services/socketService');
const sensorService = require('./services/sensorService');
const mqttService = require('./services/mqttService');
const { validateSensorData, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());

// Initialize services
socketService.init(server);
sensorService.init();
mqttService.init();

// API Endpoint for ESP32 to send data
app.post('/api/sensors', validateSensorData, (req, res, next) => {
  try {
    const data = req.body;
    const updatedData = sensorService.handleIncomingData(data);
    res.status(200).json({ status: 'success', data: updatedData });
  } catch (error) {
    next(error);
  }
});

// API Endpoint to fetch latest sensor data
app.get('/api/sensors', (req, res, next) => {
  try {
    const latestData = sensorService.getLatestData();
    console.log('GET /api/sensors - Sending:', latestData);
    res.json(latestData);
  } catch (error) {
    next(error);
  }
});

// Register error handling middleware last
app.use(errorHandler);

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
