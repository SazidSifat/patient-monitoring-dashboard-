const { processSensorData } = require('./dataProcessor');
const socketService = require('./socketService');

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

function init() {
  // Check device status every 1 second
  setInterval(() => {
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
      
      socketService.broadcast('sensorData', latestSensorData);
    }
  }, 1000);
}

function getLatestData() {
  return latestSensorData;
}

function handleIncomingData(data) {
  if (!data) {
    throw new Error('No data provided');
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
  socketService.broadcast('sensorData', latestSensorData);

  if (processedData.fallDetected) {
    socketService.broadcast('alert', { 
      type: 'FALL_DETECTED', 
      message: 'Patient fall detected!', 
      timestamp: Date.now() 
    });
  }

  return latestSensorData;
}

module.exports = {
  init,
  getLatestData,
  handleIncomingData
};
