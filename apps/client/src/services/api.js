import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Add error interceptor
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.message);
        return Promise.reject(error);
    }
);

export const socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
});

// Socket connection events
socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

socket.on('reconnect_attempt', () => {
    console.log('Attempting to reconnect...');
});

export const getSensorData = async () => {
    try {
        const response = await api.get('/sensors');
        console.log('getSensorData response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch sensor data:', error);
        // Return default data on error
        return {
            ecg: [],
            pulse: 0,
            bp: { systole: 0, diastole: 0 },
            temp: 0,
            gyro: { x: 0, y: 0, z: 0 },
            fallDetected: false,
            deviceStatus: 'offline',
            timestamp: Date.now()
        };
    }
};
