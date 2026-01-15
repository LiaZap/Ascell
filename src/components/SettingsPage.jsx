import { Save, QrCode, Smartphone, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useState, useEffect } from 'react';

const SettingsPage = ({ formData, onChange, user }) => {
    const isAdmin = user?.role === 'Administrador';
    const [instancePhone, setInstancePhone] = useState('');
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [isLoadingQr, setIsLoadingQr] = useState(false);
    const [realStatus, setRealStatus] = useState('checking');

    // Auto-check connection on mount
    useEffect(() => {
        const autoCheck = async () => {
            try {
                const data = await api.getConnectionStatus();
                console.log('Auto-check response:', data); // Debug for user

                if (data && data.instance && (data.instance.status === 'open' || data.instance.status === 'connected')) {

                    // Connected! Update status
                    onChange('instanceStatus', 'connected');

                    // Auto-fill phone if available in response
                    const remotePhone = data.instance.owner?.split('@')[0];
                    if (remotePhone) {
                        setInstancePhone(remotePhone); // Update local state
                        onChange('instancePhone', remotePhone); // Update global/form state
                    }
                }
            } catch (err) {
                console.warn('Auto-check failed', err);
            }
        };
        autoCheck();
    }, []);

    const handleSaveSettings = async (updates = {}) => {
        // Automatic Extraction Logic
        let derivedServerUrl = formData.serverUrl;
        let derivedToken = formData.instanceToken;

        // Try to extract from qrWebhookUrl or webhookUrl if explicitly saving those or if they changed
        const sourceUrl = updates.qrWebhookUrl || formData.qrWebhookUrl;

        if (sourceUrl) {
            try {
                const urlObj = new URL(sourceUrl);
                // Extract Base URL (e.g. https://api.uazapi.com)
                derivedServerUrl = urlObj.origin;

                // Extract Token (from ?token=, ?key=, or standard header logic if implied)
                // Common pattern: ?token=XYZ or ?apikey=XYZ
                const params = new URLSearchParams(urlObj.search);
                derivedToken = params.get('token') || params.get('apikey') || params.get('key') || derivedToken;
            } catch (e) {
                console.warn('Could not extract details from URL', e);
            }
        }

        const payload = {
            webhookUrl: formData.webhookUrl,
            qrWebhookUrl: formData.qrWebhookUrl,
            instancePhone: formData.instancePhone,
            instanceStatus: formData.instanceStatus,
            serverUrl: derivedServerUrl,
            instanceToken: derivedToken,
            ...updates
        };

        try {
            await api.updateSettings(payload);

            // Update local storage explicitly just in case
            localStorage.setItem('settings_webhookUrl', payload.webhookUrl);
            localStorage.setItem('settings_qrWebhookUrl', payload.qrWebhookUrl);
            localStorage.setItem('instancePhone', payload.instancePhone);
            localStorage.setItem('instanceStatus', payload.instanceStatus);
            localStorage.setItem('serverUrl', payload.serverUrl);
            localStorage.setItem('instanceToken', payload.instanceToken);

            // Force update form data locally so UI reflects immediately without reload
            onChange('serverUrl', payload.serverUrl);
            onChange('instanceToken', payload.instanceToken);

            return true;
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar configurações: ' + error.message);
            return false;
        }
    };

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

    // Check Real Status
    useEffect(() => {
        let interval;
        if (formData.instanceStatus === 'connected') {
            const check = async () => {
                const data = await api.getConnectionStatus();
                // Check format: { instance: { status: 'open' | 'connected' } }
                if (data && data.instance && (data.instance.status === 'open' || data.instance.status === 'connected')) {
                    setRealStatus('open');
                } else {
                    setRealStatus('disconnected');
                }
            };
            check();
            // Poll every 10 seconds to keep it fresh
            interval = setInterval(check, 10000);
        } else {
            setRealStatus('disconnected');
        }
        return () => clearInterval(interval);
    }, [formData.instanceStatus]);

    const StatusDisplay = () => {
        if (realStatus === 'checking') {
            return (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
                    <span className="font-bold text-yellow-400 text-xs">Verificando...</span>
                </div>
            );
        }
        if (realStatus === 'open') {
            return (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    <span className="font-bold text-white lowercase">connected</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="font-bold text-red-400 lowercase">disconnected (falha)</span>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
                <p className="text-gray-500 text-sm">Gerencie as integrações e preferências do sistema.</p>
            </div>

            {/* Main Grid */}
            <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-xl'} gap-6 max-w-5xl`}>

                {/* Column 1: Integrations */}
                {isAdmin && (
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
                                        const success = await handleSaveSettings();
                                        if (success) alert('Configurações salvas com sucesso!');
                                    }}
                                >
                                    <Save size={18} />
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                        {formData.instancePhone ? (
                            // Connected State (Dark Card UI)
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                {/* Card Container */}
                                <div className="bg-[#0f172a] rounded-xl p-0 relative overflow-hidden group shadow-xl">
                                    {/* Dashed Border Container */}
                                    <div className="absolute inset-0 m-1 border-2 border-dashed border-sky-500/30 rounded-lg pointer-events-none group-hover:border-sky-500/50 transition-colors"></div>

                                    <div className="flex flex-col md:flex-row h-full relative z-10">

                                        {/* Left Side: Instance Data */}
                                        <div className="flex-1 p-6 md:p-8 space-y-6">
                                            <h4 className="font-bold text-xl text-white">Dados da instância</h4>

                                            <div className="space-y-5">
                                                <div>
                                                    <p className="text-slate-400 text-xs font-semibold mb-1">Server URL:</p>
                                                    <p className="font-mono text-sm text-sky-400 truncate hover:text-sky-300 transition-colors select-all">
                                                        {formData.serverUrl || 'https://api.gateway.com'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-slate-400 text-xs font-semibold mb-1">Instance Token:</p>
                                                    <p className="font-mono text-sm text-white/90 truncate select-all">
                                                        {formData.instanceToken || '••••••••••••••••••••'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-slate-400 text-xs font-semibold mb-1">Número conectado:</p>
                                                    <p className="font-mono text-lg font-bold text-white tracking-wide">
                                                        {formData.instancePhone}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-slate-400 text-xs font-semibold mb-1">Status:</p>
                                                    <StatusDisplay />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Logo Area */}
                                        <div className="w-full md:w-64 bg-white p-6 flex items-center justify-center relative">
                                            {/* Decorative Accent */}
                                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-blue-600"></div>

                                            <div className="text-center">
                                                {/* Placeholder for Logo - You can replace with <img /> */}
                                                <div className="w-20 h-20 mx-auto bg-blue-600 rounded-xl flex items-center justify-center mb-3 text-white shadow-lg">
                                                    <Smartphone size={32} />
                                                </div>
                                                <h3 className="font-bold text-slate-800 text-lg">Comercial</h3>
                                                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Grupo Ascel</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => document.querySelector('input[placeholder*="webhook/envio"]')?.focus()}
                                        className="w-full py-3 bg-[#0284c7] text-white font-bold rounded-lg hover:bg-[#0369a1] transition-all shadow-lg shadow-sky-900/20 text-sm"
                                    >
                                        Configurar Webhook
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (confirm('Tem certeza que deseja desconectar?')) {
                                                onChange('instancePhone', '');
                                                onChange('instanceStatus', 'disconnected');
                                                await handleSaveSettings({
                                                    instancePhone: '',
                                                    instanceStatus: 'disconnected',
                                                    serverUrl: '',
                                                    instanceToken: ''
                                                });
                                            }
                                        }}
                                        className="w-full py-3 bg-[#1e293b] text-red-500 font-bold rounded-lg border border-red-900/30 hover:bg-red-950/20 hover:border-red-500/50 transition-all text-sm uppercase tracking-wide"
                                    >
                                        Desconectar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Disconnected State (Form)
                            <div className="space-y-6">
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
                                    <div className="flex items-end">
                                        <button
                                            onClick={async () => {
                                                if (!formData.serverUrl || !formData.instanceToken) {
                                                    alert('Preencha Server URL e Token para verificar.');
                                                    return;
                                                }

                                                setIsLoadingQr(true); // Reuse loader
                                                try {
                                                    // Direct Frontend Fetch
                                                    const response = await fetch(`${formData.serverUrl}/instance/status`, {
                                                        method: 'GET',
                                                        headers: {
                                                            'token': formData.instanceToken,
                                                            'Content-Type': 'application/json'
                                                        }
                                                    });

                                                    if (!response.ok) throw new Error(`Erro API: ${response.status}`);

                                                    const data = await response.json();
                                                    console.log('Verification data:', data);

                                                    if (data && data.instance && (data.instance.status === 'open' || data.instance.status === 'connected')) {
                                                        alert('Conexão Verificada com Sucesso! Salvando...');

                                                        // Auto-fill phone if found
                                                        const remotePhone = data.instance.owner?.split('@')[0] || instancePhone;
                                                        setInstancePhone(remotePhone);
                                                        onChange('instancePhone', remotePhone);

                                                        // Save Globally
                                                        onChange('instanceStatus', 'connected');
                                                        await handleSaveSettings({
                                                            instancePhone: remotePhone,
                                                            instanceStatus: 'connected',
                                                            serverUrl: formData.serverUrl,
                                                            instanceToken: formData.instanceToken
                                                        });
                                                    } else {
                                                        alert('A API respondeu, mas o status não é "connected". Status: ' + (data?.instance?.status || 'desconhecido'));
                                                    }
                                                } catch (error) {
                                                    console.error(error);
                                                    alert('Falha ao verificar conexão: ' + error.message);
                                                } finally {
                                                    setIsLoadingQr(false);
                                                }
                                            }}
                                            className="w-full px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                            Testar e Salvar Conexão
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Server URL (Opcional)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                                            placeholder="https://api.uazapi.com"
                                            value={formData.serverUrl || ''}
                                            onChange={(e) => onChange('serverUrl', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Token da Instância (Opcional)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                                            placeholder="Ex: 502ed0fa..."
                                            value={formData.instanceToken || ''}
                                            onChange={(e) => onChange('instanceToken', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={async () => {
                                        // If user wants to manually save without generating QR (for testing or if already connected)
                                        if (instancePhone) {
                                            onChange('instancePhone', instancePhone);
                                            onChange('instanceStatus', 'connected');

                                            // Explicitly pass manual inputs to override any auto-extraction
                                            await handleSaveSettings({
                                                instancePhone: instancePhone,
                                                instanceStatus: 'connected',
                                                serverUrl: formData.serverUrl,
                                                instanceToken: formData.instanceToken
                                            });
                                        } else {
                                            handleGenerateQRCode();
                                        }
                                    }}
                                    disabled={!instancePhone}
                                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingQr ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <QrCode size={18} />
                                            Gerar QR Code / Salvar
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
                                            <p className="text-xs mt-1 max-w-[200px] mx-auto opacity-70">Preencha os dados acima e clique em "Salvar" para conectar.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;
