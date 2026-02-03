import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Send, CheckCircle, XCircle, Calendar, ArrowUpRight, ArrowDownRight, Target, Filter, Download } from 'lucide-react';
import { api } from '../services/api';

const AnalyticsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7'); // '7', '14', '30', 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        const loadLogs = async () => {
            setLoading(true);
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

    // Filter logs based on date range
    const getFilteredLogs = () => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        
        let startDate;
        let endDate = now;

        if (dateRange === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate + 'T00:00:00');
            endDate = new Date(customEndDate + 'T23:59:59');
        } else {
            const days = parseInt(dateRange) || 7;
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days + 1);
            startDate.setHours(0, 0, 0, 0);
        }

        return logs.filter(log => {
            if (!log.date) return false;
            const logDate = new Date(log.date);
            return logDate >= startDate && logDate <= endDate;
        });
    };

    const filteredLogs = getFilteredLogs();

    // Process data for charts
    const today = new Date().toISOString().split('T')[0];
    const totalDispatches = filteredLogs.length;
    const successfulDispatches = filteredLogs.filter(l => l.status === 'Enviado').length;
    const failedDispatches = filteredLogs.filter(l => l.status !== 'Enviado').length;
    const successRate = totalDispatches > 0 ? Math.round((successfulDispatches / totalDispatches) * 100) : 0;
    const todayDispatches = logs.filter(l => l.date?.split('T')[0] === today).length;

    // Get data for the selected period
    const getDaysData = () => {
        const days = [];
        const numDays = dateRange === 'custom' 
            ? Math.min(Math.ceil((new Date(customEndDate) - new Date(customStartDate)) / (1000 * 60 * 60 * 24)) + 1, 30)
            : parseInt(dateRange) || 7;
        
        const startDate = dateRange === 'custom' && customStartDate 
            ? new Date(customStartDate + 'T00:00:00')
            : new Date();
        
        if (dateRange !== 'custom') {
            startDate.setDate(startDate.getDate() - numDays + 1);
        }

        for (let i = 0; i < numDays; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLogs = logs.filter(l => l.date?.split('T')[0] === dateStr);
            days.push({
                label: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
                fullDate: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                count: dayLogs.length,
                success: dayLogs.filter(l => l.status === 'Enviado').length,
                failed: dayLogs.filter(l => l.status !== 'Enviado').length,
                date: dateStr
            });
        }
        return days;
    };

    const daysData = getDaysData();
    const maxDayCount = Math.max(...daysData.map(d => d.count), 1);

    // Type distribution
    const lembreteCount = filteredLogs.filter(l => l.type === 'Lembrete').length;
    const certificadoCount = filteredLogs.filter(l => l.type === 'Certificado').length;

    // Growth calculation (compare last day vs first day in range)
    const weeklyGrowth = daysData.length >= 2 
        ? daysData[daysData.length - 1].count - daysData[0].count 
        : 0;

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Data', 'Agente', 'Cliente', 'Tipo', 'Status', 'Protocolo'];
        const rows = filteredLogs.map(log => [
            new Date(log.date).toLocaleDateString('pt-BR'),
            log.agent,
            log.client,
            log.type,
            log.status,
            log.protocol
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_${dateRange}_dias_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <BarChart3 className="text-blue-600" />
                        Análise de Disparos
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Acompanhe a performance dos seus envios de mensagens.</p>
                </div>

                {/* Date Range Selector */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setDateRange('7')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${dateRange === '7' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            7 dias
                        </button>
                        <button
                            onClick={() => setDateRange('14')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${dateRange === '14' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            14 dias
                        </button>
                        <button
                            onClick={() => setDateRange('30')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${dateRange === '30' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            30 dias
                        </button>
                        <button
                            onClick={() => setDateRange('custom')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${dateRange === 'custom' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <Filter size={12} />
                            Personalizado
                        </button>
                    </div>

                    <button
                        onClick={exportToCSV}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                    >
                        <Download size={14} />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Custom Date Range Picker */}
            {dateRange === 'custom' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">De:</label>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Até:</label>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    {(!customStartDate || !customEndDate) && (
                        <p className="text-xs text-amber-600">Selecione as datas para filtrar os resultados</p>
                    )}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={`Total no Período (${dateRange === 'custom' ? 'Personalizado' : dateRange + ' dias'})`}
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
                    title="Variação do Período"
                    value={weeklyGrowth >= 0 ? `+${weeklyGrowth}` : weeklyGrowth}
                    icon={TrendingUp}
                    trend={weeklyGrowth >= 0 ? 'up' : 'down'}
                    trendValue={weeklyGrowth >= 0 ? 'crescimento' : 'queda'}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart - Selected Period */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        Disparos nos Últimos {dateRange === 'custom' ? 'Período Selecionado' : dateRange + ' Dias'}
                    </h3>

                    <div className="flex items-end justify-between h-48 gap-1 overflow-x-auto pb-2">
                        {daysData.map((day, idx) => (
                            <div key={idx} className="flex-1 min-w-[30px] flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-cyan-500 cursor-pointer relative group"
                                    style={{ height: `${(day.count / maxDayCount) * 100}%`, minHeight: day.count > 0 ? '20px' : '4px' }}
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        <div className="font-bold">{day.count} envios</div>
                                        <div className="text-gray-300 text-[10px]">{day.fullDate}</div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-500 font-medium capitalize truncate w-full text-center">{day.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Daily Details Table */}
                    {daysData.length <= 14 && (
                        <div className="mt-6 border-t border-gray-100 pt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Detalhes por Dia</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                                {daysData.map((day, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-2 text-center hover:bg-gray-100 transition-colors">
                                        <p className="text-[10px] text-gray-500 uppercase">{day.label}</p>
                                        <p className="text-xs text-gray-400">{day.fullDate}</p>
                                        <p className="text-lg font-bold text-blue-600">{day.count}</p>
                                        <div className="flex justify-center gap-2 text-[10px]">
                                            <span className="text-emerald-600">✓{day.success}</span>
                                            {day.failed > 0 && <span className="text-red-500">✗{day.failed}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
