import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Atualiza o state para que a próxima renderização mostre a UI alternativa.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Você também pode registrar o erro em um serviço de relatório de erros
        console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
        this.setState({ errorInfo });

        // Opcional: Limpar localStorage se suspeitarmos de dados corrompidos
        if (error.message && (error.message.includes("JSON") || error.message.includes("storage"))) {
            console.warn("Limpando localStorage devido a possível corrupção de dados.");
            localStorage.clear();
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleResetParams = () => {
        localStorage.clear();
        window.location.href = '/';
    }

    render() {
        if (this.state.hasError) {
            // Você pode renderizar qualquer UI alternativa
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
                    <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-red-500 w-8 h-8" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado.</h1>
                        <p className="text-slate-400 mb-6 text-sm">
                            Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
                        </p>

                        <div className="bg-slate-950/50 rounded-lg p-4 mb-6 text-left overflow-auto max-h-40 border border-slate-800">
                            <code className="text-red-400 text-xs font-mono break-all">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Recarregar Página
                            </button>

                            <button
                                onClick={this.handleResetParams}
                                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3 rounded-xl transition-colors text-sm"
                            >
                                Limpar Dados e Reiniciar
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
