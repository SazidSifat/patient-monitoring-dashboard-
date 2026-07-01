const { Server } = require('socket.io');

let io = null;

function init(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for now, restrict in production
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // To avoid circular dependencies, require sensorService on demand
    const sensorService = require('./sensorService');
    socket.emit('sensorData', sensorService.getLatestData());

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

function getIO() {
  return io;
}

function broadcast(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = {
  init,
  getIO,
  broadcast
};
