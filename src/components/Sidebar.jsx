import { LayoutDashboard, FileText, Users, LogOut, Settings, BarChart3, ChevronRight, Sparkles } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange, onLogout, user }) => {

    const allMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Operador', 'Administrador', 'Supervisor'] },
        { id: 'analytics', label: 'Análise de Disparos', icon: BarChart3, roles: ['Administrador', 'Supervisor'] },
        { id: 'logs', label: 'Logs de Disparo', icon: FileText, roles: ['Administrador', 'Supervisor'] },
        { id: 'users', label: 'Gestão de Usuários', icon: Users, roles: ['Administrador', 'Supervisor'] },
        { id: 'settings', label: 'Configurações', icon: Settings, roles: ['Administrador', 'Supervisor'] },
    ];

    const menuItems = allMenuItems.filter(item =>
        item.roles.includes(user?.role || 'Operador')
    );

    return (
        <aside className="w-64 bg-gradient-to-b from-[#0f2847] via-[#1a3a5c] to-[#0f2847] text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Brand Header */}
            <div className="relative p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                            ASCEL Supervisor
                        </h1>
                        <p className="text-[10px] text-blue-300/60 font-medium uppercase tracking-widest">
                            Admin Console
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="relative flex-1 px-3 py-6">
                <p className="px-4 text-[10px] font-semibold text-blue-300/40 uppercase tracking-widest mb-3">
                    Menu Principal
                </p>

                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden ${activeView === item.id
                                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-white shadow-lg shadow-blue-500/5 border border-blue-400/20'
                                : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {/* Active Indicator */}
                            {activeView === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            )}

                            {/* Icon Container */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${activeView === item.id
                                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md shadow-blue-500/30'
                                    : 'bg-white/5 group-hover:bg-white/10'
                                }`}>
                                <item.icon size={16} className={activeView === item.id ? 'text-white' : 'text-blue-300 group-hover:text-white'} />
                            </div>

                            <span className="flex-1 text-left">{item.label}</span>

                            {activeView === item.id && (
                                <ChevronRight size={14} className="text-blue-300 animate-pulse" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* User Profile Footer */}
            <div className="relative p-4 border-t border-white/5 bg-black/10 backdrop-blur-sm">
                <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 group"
                    onClick={onLogout}
                >
                    {/* Avatar with Status */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 flex items-center justify-center border border-blue-400/20 shadow-inner">
                            <span className="text-xs font-bold text-white">
                                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                            </span>
                        </div>
                        {/* Online Status Dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f2847] shadow-lg shadow-emerald-500/40"></div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">
                            {user?.name || 'Administrador'}
                        </p>
                        <p className="text-[10px] text-blue-300/50 truncate font-medium">
                            {user?.email || 'admin@ascel.com'}
                        </p>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={14} className="text-blue-300/50 group-hover:text-red-400 transition-colors" />
                    </div>
                </div>

                {/* Version Tag */}
                <p className="text-center text-[9px] text-blue-400/30 mt-3 font-medium">
                    v2.1.0 • Enterprise Edition
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
