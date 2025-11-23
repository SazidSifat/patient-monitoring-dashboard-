import React, { useEffect, useState } from 'react';
import { socket, getSensorData } from '../services/api';
import VitalsCard from './VitalsCard';
import ECGChart from './ECGChart';
import { Heart, Thermometer, Activity, AlertTriangle, Wind } from 'lucide-react';
import logo from '../../public/Healthcare.png';

const Dashboard = () => {
    const [data, setData] = useState({
        ecg: [],
        pulse: 0,
        bp: { systole: 0, diastole: 0 },
        temp: 0,
        gyro: { x: 0, y: 0, z: 0 },
        fallDetected: false,
        timestamp: 0
    });     

    const [ecgHistory, setEcgHistory] = useState([]);
    const [alert, setAlert] = useState(null);
    const [deviceOnline, setDeviceOnline] = useState(false);

    useEffect(() => {
        getSensorData().then(initialData => {
            console.log('Initial sensor data fetched:', initialData);
            console.log('deviceStatus value:', initialData?.deviceStatus);
            console.log('deviceStatus type:', typeof initialData?.deviceStatus);
            setData(prev => ({ ...prev, ...initialData, timestamp: Date.now() }));
            // Default to offline if deviceStatus is not provided
            const status = (initialData?.deviceStatus || 'offline') === 'online';
            console.log('Setting deviceOnline to:', status);
            setDeviceOnline(status);
        }).catch(error => {
            console.error('Failed to fetch initial data:', error);
        });

        // Socket listeners
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('sensorData', (newData) => {
            if (newData) {
                console.log('📊 Sensor Data Received:', {
                    pulse: newData.pulse,
                    bp: newData.bp,
                    temp: newData.temp,
                    gyro: newData.gyro,
                    deviceStatus: newData.deviceStatus,
                    fallDetected: newData.fallDetected,
                    timestamp: new Date(newData.timestamp).toLocaleTimeString()
                });
                console.log('Full newData object:', newData);
                setData(newData);
                // Use deviceStatus from backend (default to offline if undefined)
                const status = (newData?.deviceStatus || 'offline') === 'online';
                console.log('Socket: Setting deviceOnline to:', status, 'deviceStatus:', newData?.deviceStatus);
                setDeviceOnline(status);

                setEcgHistory(prev => {
                    const newPoint = { time: Date.now(), value: newData.ecg || Math.random() * 100 };
                    const newHistory = [...prev, newPoint];
                    if (newHistory.length > 50) newHistory.shift();
                    return newHistory;
                });
            }
        });

        socket.on('alert', (alertData) => {
            setAlert(alertData);
            setTimeout(() => setAlert(null), 5000);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            setDeviceOnline(false);
            setData({
                ecg: [],
                pulse: 0,
                bp: { systole: 0, diastole: 0 },
                temp: 0,
                gyro: { x: 0, y: 0, z: 0 },
                fallDetected: false,
                timestamp: 0
            });
            setEcgHistory([]);
            console.log('📊 Data cleared - server disconnected');
        });

       
        const timeoutInterval = setInterval(() => {
            // Backend handles device offline detection, nothing to do here
            // This interval is kept for potential future use
        }, 1000);

        return () => {
            socket.off('sensorData');
            socket.off('alert');
            socket.off('connect');
            socket.off('disconnect');
            socket.off('error');
            clearInterval(timeoutInterval);
        };
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <img src={logo} alt="Healthcare Logo" className="w-12 h-12" />
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Patient Monitor</h1>
                        <p className="text-slate-400">Patient ID: P-36</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
                        deviceOnline 
                            ? 'bg-green-500/10 border-green-500/50' 
                            : 'bg-red-500/10 border-red-500/50'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${
                            deviceOnline 
                                ? 'bg-green-500 animate-pulse' 
                                : 'bg-red-500 animate-pulse'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                            deviceOnline 
                                ? 'text-green-400' 
                                : 'text-red-400'
                        }`}>
                            Device {deviceOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Alerts Section */}
            {alert && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 animate-bounce">
                    <AlertTriangle className="text-red-500" size={32} />
                    <div>
                        <h3 className="text-red-500 font-bold text-lg">CRITICAL ALERT</h3>
                        <p className="text-red-400">{alert.message}</p>
                    </div>
                </div>
            )}

            {data.fallDetected && !alert && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                    <AlertTriangle className="text-red-500" size={32} />
                    <div>
                        <h3 className="text-red-500 font-bold text-lg">FALL DETECTED</h3>
                        <p className="text-red-400">Patient fall event recorded. Check immediately.</p>
                    </div>
                </div>
            )}

            {/* Vitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <VitalsCard
                    title="Heart Rate"
                    value={data.pulse}
                    unit="BPM"
                    icon={Heart}
                    color="text-rose-500"
                    status={data.pulse > 100 || data.pulse < 60 ? 'Warning' : 'Normal'}
                />
                <VitalsCard
                    title="Blood Pressure"
                    value={`${data.bp.systole}/${data.bp.diastole}`}
                    unit="mmHg"
                    icon={Activity}
                    color="text-blue-500"
                    status="Normal"
                />
                <VitalsCard
                    title="Temperature"
                    value={data.temp}
                    unit="°C"
                    icon={Thermometer}
                    color="text-amber-500"
                    status={data.temp > 37.5 ? 'Fever' : 'Normal'}
                />
                <VitalsCard
                    title="Oxygen Level"
                    value="98"
                    unit="%"
                    icon={Wind}
                    color="text-cyan-500"
                    status="Normal"
                />
            </div>

            {/* ECG Chart - Full Width */}
            <div className="grid grid-cols-1 gap-6">
                <div className="lg:col-span-1">
                    <ECGChart data={ecgHistory} deviceOnline={deviceOnline} />
                </div>
            </div>

            {/* Gyro Data / Movement Section - Bottom */}
            <div className="grid grid-cols-1 gap-6">
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-indigo-500/20">
                            <Activity size={24} className="text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Movement & Activity</h3>
                            <p className="text-slate-400 text-xs">Gyroscope & Accelerometer Data</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-4 rounded-lg bg-linear-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/30">
                            <span className="text-slate-400 text-sm mb-2">Axis X</span>
                            <span className="font-mono text-indigo-400 text-2xl font-bold">{data.gyro.x.toFixed(2)}</span>
                            <span className="text-slate-500 text-xs mt-1">°/s</span>
                        </div>
                        <div className="flex flex-col items-center p-4 rounded-lg bg-linear-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/30">
                            <span className="text-slate-400 text-sm mb-2">Axis Y</span>
                            <span className="font-mono text-indigo-400 text-2xl font-bold">{data.gyro.y.toFixed(2)}</span>
                            <span className="text-slate-500 text-xs mt-1">°/s</span>
                        </div>
                        <div className="flex flex-col items-center p-4 rounded-lg bg-linear-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/30">
                            <span className="text-slate-400 text-sm mb-2">Axis Z</span>
                            <span className="font-mono text-indigo-400 text-2xl font-bold">{data.gyro.z.toFixed(2)}</span>
                            <span className="text-slate-500 text-xs mt-1">°/s</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
