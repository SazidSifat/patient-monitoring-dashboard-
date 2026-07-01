import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

const ECGChart = ({ data = [], deviceOnline = false }) => {
    // Expecting data to be an array of values or objects
    // For simplicity, assuming data is an array of objects { time, value }
    const chartData = Array.isArray(data) && data.length > 0 ? data : [{ time: 0, value: 0 }];

    return (
        <div className="card col-span-full lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                        <Activity size={24} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">ECG Live Stream</h3>
                        <p className="text-slate-400 text-xs">Real-time heart activity monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">

                    {
                        deviceOnline ? (
                            <div className="flex items-center gap-2">
                                <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-xs text-red-400 font-medium">LIVE</span>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400 font-medium">OFFLINE</span>
                        )
                    }
                </div>
            </div>

            <div className="h-64 w-full bg-slate-900/50 rounded-lg border border-slate-800 p-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <YAxis domain={['auto', 'auto']} hide />
                        <XAxis dataKey="time" hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#ef4444' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false} // Disable animation for smoother real-time updates
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ECGChart;
