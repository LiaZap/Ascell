import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Send, CheckCircle, XCircle, Calendar, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { api } from '../services/api';

const AnalyticsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                const data = await api.getLogs();
                setLogs(data || []);
            } catch (err) {
                console.error('Failed to load logs for analytics', err);
            } finally {
                setLoading(false);
            }
        };
        loadLogs();
    }, []);

    // Process data for charts
    const today = new Date().toISOString().split('T')[0];
    const totalDispatches = logs.length;
    const successfulDispatches = logs.filter(l => l.status === 'Enviado').length;
    const failedDispatches = logs.filter(l => l.status !== 'Enviado').length;
    const successRate = totalDispatches > 0 ? Math.round((successfulDispatches / totalDispatches) * 100) : 0;
    const todayDispatches = logs.filter(l => l.date?.split('T')[0] === today).length;

    // Get last 7 days data
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLogs = logs.filter(l => l.date?.split('T')[0] === dateStr);
            days.push({
                label: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
                count: dayLogs.length,
                date: dateStr
            });
        }
        return days;
    };

    const last7Days = getLast7Days();
    const maxDayCount = Math.max(...last7Days.map(d => d.count), 1);

    // Type distribution
    const lembreteCount = logs.filter(l => l.type === 'Lembrete').length;
    const certificadoCount = logs.filter(l => l.type === 'Certificado').length;

    // Growth calculation (compare this week vs last recorded data point)
    const weeklyGrowth = last7Days[6].count - last7Days[0].count;

    const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {trendValue}
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <BarChart3 className="text-blue-600" />
                    Análise de Disparos
                </h2>
                <p className="text-gray-500 text-sm mt-1">Acompanhe a performance dos seus envios de mensagens.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total de Disparos"
                    value={totalDispatches}
                    icon={Send}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Taxa de Sucesso"
                    value={`${successRate}%`}
                    icon={Target}
                    trend={successRate >= 90 ? 'up' : undefined}
                    trendValue={successRate >= 90 ? 'Excelente' : undefined}
                    color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
                <StatCard
                    title="Disparos Hoje"
                    value={todayDispatches}
                    icon={Calendar}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Variação Semanal"
                    value={weeklyGrowth >= 0 ? `+${weeklyGrowth}` : weeklyGrowth}
                    icon={TrendingUp}
                    trend={weeklyGrowth >= 0 ? 'up' : 'down'}
                    trendValue={weeklyGrowth >= 0 ? 'crescimento' : 'queda'}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart - Last 7 Days */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        Disparos nos Últimos 7 Dias
                    </h3>

                    <div className="flex items-end justify-between h-48 gap-2">
                        {last7Days.map((day, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-cyan-500 cursor-pointer relative group"
                                    style={{ height: `${(day.count / maxDayCount) * 100}%`, minHeight: day.count > 0 ? '20px' : '4px' }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {day.count} envios
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 font-medium capitalize">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pie Chart - Success Rate */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-600" />
                        Status dos Envios
                    </h3>

                    {/* Simple Donut Chart */}
                    <div className="relative w-40 h-40 mx-auto">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {/* Background Circle */}
                            <circle
                                cx="50" cy="50" r="40"
                                stroke="#f3f4f6" strokeWidth="12" fill="none"
                            />
                            {/* Success Arc */}
                            <circle
                                cx="50" cy="50" r="40"
                                stroke="url(#successGradient)" strokeWidth="12" fill="none"
                                strokeDasharray={`${successRate * 2.51} 251`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                            <defs>
                                <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#34d399" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{successRate}%</span>
                            <span className="text-xs text-gray-500">Sucesso</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-gray-600">Enviados</span>
                            </div>
                            <span className="font-bold text-gray-900">{successfulDispatches}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-gray-600">Falhas</span>
                            </div>
                            <span className="font-bold text-gray-900">{failedDispatches}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Type Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 size={18} className="text-purple-600" />
                    Distribuição por Tipo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lembrete */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Lembretes de Reunião</span>
                            <span className="text-2xl font-bold text-blue-600">{lembreteCount}</span>
                        </div>
                        <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700"
                                style={{ width: `${totalDispatches > 0 ? (lembreteCount / totalDispatches) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {totalDispatches > 0 ? Math.round((lembreteCount / totalDispatches) * 100) : 0}% do total
                        </p>
                    </div>

                    {/* Certificado */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Aprovação de Certificado</span>
                            <span className="text-2xl font-bold text-purple-600">{certificadoCount}</span>
                        </div>
                        <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                                style={{ width: `${totalDispatches > 0 ? (certificadoCount / totalDispatches) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {totalDispatches > 0 ? Math.round((certificadoCount / totalDispatches) * 100) : 0}% do total
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
