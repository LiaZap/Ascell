import { Wifi } from 'lucide-react';

const StatusIndicator = () => {
    // In a real app, this would ping the n8n URL
    const isOnline = true;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200'
            }`}>
            <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-red-400'
                    }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></span>
            </span>
            <span>{isOnline ? 'API Conectada' : 'API Desconectada'}</span>
            <Wifi size={14} />
        </div>
    );
};

export default StatusIndicator;
