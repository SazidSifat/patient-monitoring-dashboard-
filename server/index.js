const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { processSensorData } = require('./services/dataProcessor');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now, restrict in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Store latest sensor data
let latestSensorData = {
  ecg: [],
  pulse: 0,
  bp: { systole: 0, diastole: 0 },
  temp: 0,
  gyro: { x: 0, y: 0, z: 0 },
  fallDetected: false,
  deviceStatus: 'offline',
  timestamp: Date.now()
};

let lastDataReceivedTime = 0;  // Start at 0 so first check will mark offline until data arrives
const DEVICE_OFFLINE_TIMEOUT = 5000;  // 5 seconds without data = offline

// Check device status every 1 second
const deviceStatusInterval = setInterval(() => {
  const timeSinceLastData = Date.now() - lastDataReceivedTime;
  const deviceStatus = timeSinceLastData > DEVICE_OFFLINE_TIMEOUT ? 'offline' : 'online';

  if (latestSensorData.deviceStatus !== deviceStatus) {
    latestSensorData.deviceStatus = deviceStatus;
    console.log(`📡 Device Status Changed: ${deviceStatus.toUpperCase()}`);
    
    // If device goes offline, clear all sensor data
    if (deviceStatus === 'offline') {
      latestSensorData = {
        ecg: [],
        pulse: 0,
        bp: { systole: 0, diastole: 0 },
        temp: 0,
        gyro: { x: 0, y: 0, z: 0 },
        fallDetected: false,
        deviceStatus: 'offline',
        timestamp: Date.now()
      };
      console.log('📊 Sensor data cleared - Device OFFLINE');
    }
    
    io.emit('sensorData', latestSensorData);
  }
}, 1000);

// API Endpoint for ESP32 to send data
app.post('/api/sensors', (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ status: 'error', message: 'No data provided' });
    }

    // Track when data is received
    lastDataReceivedTime = Date.now();

    const processedData = processSensorData(data);

   
    latestSensorData = {
      ...latestSensorData,
      ...processedData,
      deviceStatus: 'online',  
      timestamp: Date.now()
    };

    console.log(`📊 Data received from ESP32 - Device is ONLINE`);

    // Emit to frontend via WebSocket
    io.emit('sensorData', latestSensorData);

    if (processedData.fallDetected) {
      io.emit('alert', { type: 'FALL_DETECTED', message: 'Patient fall detected!', timestamp: Date.now() });
    }

    res.status(200).json({ status: 'success', data: latestSensorData });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ status: 'error', message: 'Failed to process sensor data' });
  }
});

app.get('/api/sensors', (req, res) => {
  try {
    console.log('GET /api/sensors - Sending:', latestSensorData);
    res.json(latestSensorData);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch sensor data' });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('sensorData', latestSensorData);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
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
