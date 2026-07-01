const mqtt = require('mqtt');
const sensorService = require('./sensorService');

let client = null;

function init() {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';
  const topic = process.env.MQTT_TOPIC || 'patient/sensors';

  console.log(`🔌 Connecting to MQTT Broker at ${brokerUrl}...`);
  client = mqtt.connect(brokerUrl);

  client.on('connect', () => {
    console.log(`✅ Connected to MQTT Broker!`);
    client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`📡 Subscribed to MQTT topic: ${topic}`);
      } else {
        console.error(`❌ Failed to subscribe to topic: ${topic}`, err);
      }
    });
  });

  client.on('message', (receivedTopic, message) => {
    try {
      if (receivedTopic === topic) {
        const payloadString = message.toString();
        // Parse incoming JSON data
        const data = JSON.parse(payloadString);
        
        // Delegate to sensorService
        sensorService.handleIncomingData(data);
      }
    } catch (error) {
      console.error('❌ Error handling incoming MQTT message:', error.message);
    }
  });

  client.on('error', (error) => {
    console.error('❌ MQTT Client Error:', error);
  });

  client.on('offline', () => {
    console.warn('⚠️ MQTT Client offline, attempting reconnect...');
  });
}

module.exports = {
  init
};
