import { Wifi } from 'lucide-react';

const StatusIndicator = ({ isConnected = false }) => {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${isConnected
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200'
            }`}>
            <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'
                    }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></span>
            </span>
            <span>{isConnected ? 'API Conectada' : 'API Desconectada'}</span>
            <Wifi size={14} />
        </div>
    );
};

export default StatusIndicator;
