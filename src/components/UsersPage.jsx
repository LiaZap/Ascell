import { Search, UserPlus, MoreVertical, Edit2, Trash2, X, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Operador' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            if (data && data.length > 0) {
                setUsers(data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            if (!newUser.name || !newUser.email || !newUser.password) return;

            await api.createUser({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role
            });

            await fetchUsers();
            setIsAdding(false);
            setNewUser({ name: '', email: '', password: '', role: 'Operador' });
        } catch (error) {
            console.error(error);
            alert('Erro ao criar usuário');
        }
    };

    const handleDeleteUser = async (id) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await api.deleteUser(id);
                // Optimistic update or refetch
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                console.error(error);
                alert('Erro ao excluir usuário');
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
                    <p className="text-gray-500 text-sm">Gerencie o acesso e permissões da equipe.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:translate-y-0.5"
                >
                    <UserPlus size={18} />
                    Adicionar Usuário
                </button>
            </div>

            {/* Add User Form (Collapsible) */}
            {isAdding && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Novo Usuário</h3>
                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-700">Nome</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Nome completo"
                                value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="usuario@email.com"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-700">Senha</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="••••••••"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-xs font-medium text-gray-700">Função</label>
                                <select
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="Operador">Operador</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                        Carregando usuários...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 uppercase">
                                                    {user.name && user.name.length > 0 ? user.name.charAt(0) : '?'}
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
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
