import { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const LoginPage = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await api.login(credentials.email, credentials.password);
            onLogin(data.user, data.token);
        } catch (err) {
            setError('Email ou senha incorretos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#0f172a]">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Olá, bem-vindo(a)! 👋</h1>
                        <p className="text-slate-400">Entre com suas credenciais para acessar o painel.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                                <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/20" />
                                Lembrar-me
                            </label>
                            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Esqueceu a senha?</a>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Entrar na Plataforma <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-sm">
                        Problemas com acesso? <a href="#" className="text-slate-400 hover:text-white transition-colors">Contate o suporte</a>
                    </p>
                </div>
            </div>

            {/* Right Side - Hero/Branding */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#020617] items-center justify-center">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 text-center space-y-8 p-12 max-w-lg">
                    <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                        {/* Logo Placeholder */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold text-white tracking-tight">
                            AScel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Supervisor</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Controle total da sua operação de mensagens, logs e gestão de equipe em um único lugar.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
                        <div className="text-center">
                            <h4 className="text-2xl font-bold text-white">24/7</h4>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Monitoramento</span>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <h4 className="text-2xl font-bold text-white">100%</h4>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Segurança</span>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <h4 className="text-2xl font-bold text-white">Pro</h4>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Gestão</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
