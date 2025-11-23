import React from 'react';

// eslint-disable-next-line no-unused-vars
const VitalsCard = ({ title, value, unit, icon: Icon, color, status }) => {
    const isWarning = status && status !== 'Normal';
    
    return (
        <div className={`card flex flex-col justify-between relative overflow-hidden group hover:scale-105 transition-all duration-300 border-2 ${
            isWarning 
                ? 'border-red-500/50 bg-linear-to-br from-red-500/5 to-red-500/2 shadow-lg shadow-red-500/20' 
                : 'border-slate-700/50 bg-linear-to-br from-slate-800/50 to-slate-900/50'
        }`}>
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon size={64} className={isWarning ? 'text-red-500' : color} />
            </div>

            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-opacity-20 ${isWarning ? 'bg-red-500/30' : color.replace('text-', 'bg-')}`}>
                    <Icon size={24} className={isWarning ? 'text-red-500' : color} />
                </div>
                <h3 className={`font-medium text-sm uppercase tracking-wider ${isWarning ? 'text-red-400' : 'text-slate-400'}`}>{title}</h3>
            </div>

            <div className="mt-2">
                <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${isWarning ? 'text-red-400' : 'text-white'}`}>{value}</span>
                    <span className={`text-sm font-medium ${isWarning ? 'text-red-400/70' : 'text-slate-500'}`}>{unit}</span>
                </div>
                {status && (
                    <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full inline-block uppercase tracking-wider ${status === 'Normal' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VitalsCard;
