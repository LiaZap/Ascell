import { Search, UserPlus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

const UsersPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await api.getUsers();
            if (data && data.length > 0) {
                setUsers(data);
            } else {
                // Fallback Mock
                setUsers([
                    { id: 1, name: 'Paulo Admin', email: 'paulo@ascel.com', role: 'Administrador', lastLogin: '13/01/2026 12:10', status: 'Ativo' },
                    { id: 2, name: 'Maria Silva', email: 'maria@ascel.com', role: 'Operador', lastLogin: '13/01/2026 09:00', status: 'Ativo' },
                ]);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
                    <p className="text-gray-500 text-sm">Gerencie o acesso e permissões da equipe.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:translate-y-0.5">
                    <UserPlus size={18} />
                    Adicionar Usuário
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Table Header/Toolbar */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div className="relative w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar usuário..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nome</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Função</th>
                                <th className="px-6 py-4 font-semibold">Último Acesso</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'Administrador' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{user.lastLogin}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === 'Ativo'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Ativo' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary transition-colors" title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600 transition-colors" title="Excluir">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
