import { Save } from 'lucide-react';

const SettingsPage = ({ formData, onChange }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
                <p className="text-gray-500 text-sm">Gerencie as integrações e preferências do sistema.</p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Integrações Externas</h3>
                    <p className="text-sm text-gray-500 mt-1">Configure a conexão com n8n e outras ferramentas.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">URL do Webhook (n8n)</label>
                        <div className="relative">
                            <input
                                type="url"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                                placeholder="https://n8n.seu-dominio.com/webhook/..."
                                value={formData.webhookUrl}
                                onChange={(e) => onChange('webhookUrl', e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Esta URL receberá todos os dados do formulário ao clicar em "Agendar".
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:translate-y-0.5">
                            <Save size={18} />
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
