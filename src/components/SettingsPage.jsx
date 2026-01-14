import { Save, QrCode, Smartphone, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useState } from 'react';

const SettingsPage = ({ formData, onChange }) => {
    const [instancePhone, setInstancePhone] = useState('');
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [isLoadingQr, setIsLoadingQr] = useState(false);

    const handleGenerateQRCode = async () => {
        if (!formData.qrWebhookUrl || !instancePhone) {
            alert('Por favor, preencha a URL do Webhook e o Telefone da Instância.');
            return;
        }

        setIsLoadingQr(true);
        setQrCodeImage(null);

        try {
            const response = await fetch(formData.qrWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: instancePhone })
            });

            if (!response.ok) throw new Error('Falha na comunicação com o Webhook');

            const data = await response.json();
            console.log('QR Code Webhook Response:', data);

            // Handle n8n array structure with nested instance (common in evolution-api / codechat)
            const firstItem = Array.isArray(data) ? data[0] : data;
            const qrContent = firstItem?.instance?.qrcode || firstItem?.qrcode || firstItem?.base64 || firstItem?.data?.qrcode;

            if (qrContent) {
                setQrCodeImage(qrContent);
            } else {
                throw new Error('QR Code não encontrado. Estrutura recebida: ' + JSON.stringify(firstItem).slice(0, 100) + '...');
            }

        } catch (error) {
            console.error(error);
            alert('Erro ao gerar QR Code: ' + error.message);
        } finally {
            setIsLoadingQr(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
                <p className="text-gray-500 text-sm">Gerencie as integrações e preferências do sistema.</p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">

                {/* Column 1: Integrations */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Integrações Externas</h3>
                        <p className="text-sm text-gray-500 mt-1">Configure a conexão com n8n e outras ferramentas.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">URL do Webhook (Envio)</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                                    placeholder="https://n8n.../webhook/envio"
                                    value={formData.webhookUrl}
                                    onChange={(e) => onChange('webhookUrl', e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Esta URL receberá os dados para envio da mensagem.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">URL do Webhook (QR Code)</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                                    placeholder="https://n8n.../webhook/qrcode"
                                    value={formData.qrWebhookUrl || ''}
                                    onChange={(e) => onChange('qrWebhookUrl', e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Webhook responsável por gerar o QR Code de conexão.
                            </p>
                        </div>


                        <div className="pt-4 flex justify-end">
                            <button
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:translate-y-0.5 w-full justify-center"
                                onClick={async () => {
                                    try {
                                        await api.updateSettings({
                                            webhookUrl: formData.webhookUrl,
                                            qrWebhookUrl: formData.qrWebhookUrl // Save new field
                                        });
                                        // Update local storage
                                        localStorage.setItem('settings_webhookUrl', formData.webhookUrl);
                                        localStorage.setItem('settings_qrWebhookUrl', formData.qrWebhookUrl);
                                        alert('Configurações salvas com sucesso!');
                                    } catch (error) {
                                        alert('Erro ao salvar: ' + error.message);
                                    }
                                }}
                            >
                                <Save size={18} />
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>

                {/* Column 2: WhatsApp Connection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                    <div className="p-6 border-b border-gray-100 bg-emerald-50/50">
                        <div className="flex items-center gap-2 text-emerald-800">
                            <QrCode size={20} />
                            <h3 className="font-semibold">Conexão WhatsApp</h3>
                        </div>
                        <p className="text-sm text-emerald-600/80 mt-1">Conecte sua instância para enviar mensagens.</p>
                    </div>

                    <div className="p-6 space-y-6">

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Telefone da Instância</label>
                            <div className="relative">
                                <Smartphone size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="tel"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="551199999999"
                                    value={instancePhone}
                                    onChange={(e) => setInstancePhone(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Informe o número conectado para gerar o QR Code de sessão.
                            </p>
                        </div>

                        <button
                            onClick={handleGenerateQRCode}
                            disabled={isLoadingQr || !formData.qrWebhookUrl || !instancePhone}
                            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingQr ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Gerando QR Code...
                                </>
                            ) : (
                                <>
                                    <QrCode size={18} />
                                    Gerar QR Code
                                </>
                            )}
                        </button>

                        {/* QR Code Display Area */}
                        <div className="mt-6 border-2 border-dashed border-gray-200 rounded-xl min-h-[250px] flex flex-col items-center justify-center bg-gray-50/50 relative overflow-hidden">
                            {qrCodeImage ? (
                                <div className="p-4 bg-white rounded-lg shadow-sm">
                                    <img src={qrCodeImage} alt="QR Code WhatsApp" className="w-56 h-56 object-contain" />
                                    <p className="text-center text-xs text-emerald-600 font-medium mt-2">Escaneie com seu WhatsApp</p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 p-6">
                                    <QrCode size={48} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Nenhum QR Code gerado</p>
                                    <p className="text-xs mt-1 max-w-[200px] mx-auto opacity-70">Preencha os dados acima e clique em "Gerar" para conectar.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;
