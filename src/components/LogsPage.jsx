import { Search, Filter, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await api.getLogs();
                // Strictly use what the API gives to ensure synchronization across all users.
                // If the DB is empty, everyone should see empty (or just the new logs as they come in).
                if (data) {
                    setLogs(data);
                } else {
                    setLogs([]);
                }
            } catch (error) {
                console.error("Failed to load logs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Logs de Disparo</h2>
                    <p className="text-gray-500 text-sm">Histórico de mensagens enviadas e status.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
                        <Filter size={16} /> Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
                        <Calendar size={16} /> Data
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou protocolo..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 w-full md:w-auto">
                    <option value="">Todos os Agentes</option>
                    <option value="maria">Maria Silva</option>
                    <option value="carlos">Carlos Oliveira</option>
                </select>
                <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 w-full md:w-auto">
                    <option value="">Todos os Tipos</option>
                    <option value="meeting">Lembrete</option>
                    <option value="certificate">Certificado</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Protocolo</th>
                                <th className="px-6 py-4 font-semibold">Data/Hora</th>
                                <th className="px-6 py-4 font-semibold">Agente</th>
                                <th className="px-6 py-4 font-semibold">Cliente</th>
                                <th className="px-6 py-4 font-semibold">Tipo</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{log.protocol}</td>
                                    <td className="px-6 py-4">{log.date}</td>
                                    <td className="px-6 py-4">{log.agent}</td>
                                    <td className="px-6 py-4">{log.client}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${log.type === 'Lembrete' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                                            }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${log.status === 'Enviado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination Mock */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Mostrando 1-5 de 24 resultados</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>Anterior</button>
                            <button className="px-3 py-1 border rounded hover:bg-gray-50">Próximo</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogsPage;
