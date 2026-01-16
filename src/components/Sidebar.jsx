import { LayoutDashboard, FileText, Users, LogOut, Settings, BarChart3, ChevronRight } from 'lucide-react';
import logoAscel from '../assets/logo-ascel.jpg';

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
        <aside className="w-64 bg-gradient-to-b from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-0 w-40 h-40 bg-red-600/5 rounded-full blur-3xl"></div>
            </div>

            {/* Brand Header with Logo */}
            <div className="relative p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <img
                        src={logoAscel}
                        alt="ASCEL"
                        className="h-12 w-auto object-contain bg-white rounded-lg p-1"
                    />
                </div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-2">
                    Sistema de Gestão
                </p>
            </div>

            {/* Navigation Section */}
            <div className="relative flex-1 px-3 py-6">
                <p className="px-4 text-[10px] font-semibold text-gray-500/60 uppercase tracking-widest mb-3">
                    Menu Principal
                </p>

                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden ${activeView === item.id
                                ? 'bg-gradient-to-r from-red-600/20 to-red-500/10 text-white shadow-lg shadow-red-500/5 border border-red-500/20'
                                : 'text-gray-300/70 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {/* Active Indicator */}
                            {activeView === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full shadow-[0_0_10px_rgba(196,30,58,0.5)]"></div>
                            )}

                            {/* Icon Container */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${activeView === item.id
                                    ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-md shadow-red-500/30'
                                    : 'bg-white/5 group-hover:bg-white/10'
                                }`}>
                                <item.icon size={16} className={activeView === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                            </div>

                            <span className="flex-1 text-left">{item.label}</span>

                            {activeView === item.id && (
                                <ChevronRight size={14} className="text-red-400 animate-pulse" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* User Profile Footer */}
            <div className="relative p-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 group"
                    onClick={onLogout}
                >
                    {/* Avatar with Status */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/30 to-red-600/20 flex items-center justify-center border border-red-500/20 shadow-inner">
                            <span className="text-xs font-bold text-white">
                                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                            </span>
                        </div>
                        {/* Online Status Dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1a1a1a] shadow-lg shadow-emerald-500/40"></div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">
                            {user?.name || 'Administrador'}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate font-medium">
                            {user?.email || 'admin@ascel.com'}
                        </p>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={14} className="text-gray-500 group-hover:text-red-400 transition-colors" />
                    </div>
                </div>

                {/* Version Tag */}
                <p className="text-center text-[9px] text-gray-600 mt-3 font-medium">
                    v2.1.0 • ASCEL Certificados Digitais
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
