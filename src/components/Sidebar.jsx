import { LayoutDashboard, FileText, Users, LogOut, Settings } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange, onLogout, user }) => {

    const allMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Operador', 'Administrador'] },
        { id: 'logs', label: 'Logs de Disparo', icon: FileText, roles: ['Administrador'] },
        { id: 'users', label: 'Gestão de Usuários', icon: Users, roles: ['Administrador'] },
        { id: 'settings', label: 'Configurações', icon: Settings, roles: ['Administrador'] },
    ];

    const menuItems = allMenuItems.filter(item =>
        item.roles.includes(user?.role || 'Operador')
    );

    return (
        <aside className="w-64 bg-[#1e4d85] text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50">
            {/* Brand */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <LayoutDashboard size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-sm tracking-wide">AScel Supervisor</h1>
                    <p className="text-[10px] text-blue-200 opacity-80">Admin Console</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${activeView === item.id
                            ? 'bg-white text-[#1e4d85] shadow-md translate-x-1'
                            : 'text-blue-100 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <item.icon size={18} className={activeView === item.id ? 'text-[#1e4d85]' : 'text-blue-200 group-hover:text-white'} />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group" onClick={onLogout}>
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                        <span className="text-xs font-bold">{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-medium truncate">{user?.name || 'Administrador'}</p>
                        <p className="text-[10px] text-blue-200 truncate">{user?.email || 'admin@ascel.com'}</p>
                    </div>
                    <LogOut size={14} className="text-blue-300 group-hover:text-red-400 transition-colors" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
