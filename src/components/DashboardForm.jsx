import { Calendar, Clock, Link as LinkIcon, User, Settings, HelpCircle, FileText, CheckCircle, Video, Shield, Loader2, AlertCircle, XCircle, RefreshCcw } from 'lucide-react';
import { MEETING_TEMPLATES, CERTIFICATE_TEMPLATES } from '../data/templates';
import { useState, useEffect } from 'react';
import { api } from '../services/api';

const DashboardForm = ({ formData, onChange, onGenerateProtocol }) => {
    const [isSending, setIsSending] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Update available templates based on type
    const currentTemplates = formData.messageType === 'meeting' ? MEETING_TEMPLATES : CERTIFICATE_TEMPLATES;

    // Reset template selection when type changes
    useEffect(() => {
        // Check if current selected template is valid for the new type
        const isValid = currentTemplates.find(t => t.id === formData.selectedTemplateId);
        if (!isValid) {
            onChange('selectedTemplateId', currentTemplates[0].id);
        }
    }, [formData.messageType]);

    // Force link format to 'text' when action button is disabled by admin
    useEffect(() => {
        if (formData.actionButtonDisabled && formData.linkFormat === 'button') {
            onChange('linkFormat', 'text');
        }
    }, [formData.actionButtonDisabled]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.webhookUrl) {
            alert('Por favor, configure a URL do Webhook na aba Configurações.');
            return;
        }

        setIsSending(true);

        try {
            // 1. Prepare Base Data
            const cleanPhone = formData.clientPhone.replace(/\D/g, '');
            const finalLink = formData.messageType === 'certificate'
                ? 'https://mp.syngularid.com.br/protocol/emissao'
                : (formData.isAutoLink
                    ? `https://ar.syngularid.com.br/videoconferencia?protocolo=${formData.protocolCode}`
                    : formData.manualLink || '');

            // 2. Select Template / Message
            let messageText = formData.customMessage;
            let usedTemplateName = 'Personalizado';

            if (formData.isRandomTemplate) {
                const randomIndex = Math.floor(Math.random() * currentTemplates.length);
                const randomTemplate = currentTemplates[randomIndex];
                messageText = randomTemplate.text;
                usedTemplateName = randomTemplate.name; // Capture name for feedback
                console.log(`[Anti-Spam] Selected Random Template: ${randomTemplate.id}`);
            }

            // 3. Interpolate Variables
            let processedMessage = messageText || '';
            console.log('Original Message for Interpolation:', processedMessage);

            // Use regex with whitespace support {{\s*key\s*}}
            processedMessage = processedMessage.replace(/{{\s*time\s*}}/gi, formData.meetingTime || '--:--');
            processedMessage = processedMessage.replace(/{{\s*protocol\s*}}/gi, formData.protocolCode);
            processedMessage = processedMessage.replace(/{{\s*agentName\s*}}/gi, formData.agentName || 'Atendente');
            processedMessage = processedMessage.replace(/{{\s*clientName\s*}}/gi, formData.clientName || 'Cliente');

            // 4. Handle Link & Format
            if (formData.linkFormat === 'button') {
                processedMessage = processedMessage.replace(/{{\s*link\s*}}/gi, '\n👉 *Clique no botão abaixo para acessar*');
            } else {
                processedMessage = processedMessage.replace(/\{\{\s*link\s*\}\}/gi, finalLink);
            }

            console.log('Final Processed Message:', processedMessage);

            // 5. Construct Payload
            // STRICT API Structure + Metadata for Logic
            const payload = {
                // Core Message Fields
                number: cleanPhone,
                type: formData.linkFormat === 'button' ? 'button' : 'text',
                text: processedMessage,

                // Metadata (Restored for Flow Logic)
                clientName: formData.clientName,
                clientPhone: cleanPhone,
                linkFormat: formData.linkFormat || 'text',
                customMessage: processedMessage, // Ensure this matches text
                protocolCode: formData.protocolCode,
                messageType: formData.messageType,
                meetingLink: finalLink, // Explicit link field for n8n to use

                // Fields for button structure
                ...(formData.linkFormat === 'button' && {
                    choices: [
                        `${formData.messageType === 'meeting' ? 'Acessar Reunião' : 'Emitir Certificado'}|${finalLink}`,
                        ...(formData.messageType === 'meeting' ? [`Reagendar Reunião|Reagendar`] : [])
                    ],
                    footerText: 'Escolha uma das opções abaixo',
                })
            };

            console.log('Sending Webhook Payload:', JSON.stringify(payload, null, 2));

            const response = await fetch(formData.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload, null, 2), // Pretty print to match user preference
            });

            if (response.ok) {
                showToast(`Enviado com sucesso! (${usedTemplateName})`, 'success');

                // Save Log to Backend for Sync
                const newLog = {
                    protocol: formData.protocolCode,
                    date: new Date().toISOString(),
                    agent: formData.agentName || 'Sistema',
                    client: formData.clientName || 'Cliente',
                    type: formData.messageType === 'meeting' ? 'Lembrete' : 'Certificado',
                    status: 'Enviado'
                };

                // Fire and forget log creation
                api.createLog(newLog).then(() => {
                    console.log('Log synced to backend');
                }).catch(err => console.error('Log sync failed', err));

                // Save to LocalStorage as backup (Optional, keeping for immediate feedback if offline)
                const existingLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
                localStorage.setItem('app_logs', JSON.stringify([{ ...newLog, id: Date.now() }, ...existingLogs]));

            } else {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Webhook Error:', error);
            showToast(`Falha ao enviar: ${error.message}`, 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-gray-800">
            {/* Premium Header */}
            <div className="relative px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white via-red-50/20 to-white overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-red-600/5 rounded-full blur-2xl"></div>

                <div className="relative flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-3 text-gray-900">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                                <Settings size={20} className="text-white" />
                            </div>
                            Configuração do Agente
                        </h2>
                        <p className="text-sm text-gray-400 mt-1 ml-[52px]">Personalize as mensagens e configurações de envio.</p>
                    </div>

                    {/* Protocol Badge - Premium */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-2.5 rounded-xl shadow-lg">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">Protocolo:</span>
                        <span className="font-bold text-sm tracking-wide">{formData.protocolCode}</span>
                        <button
                            onClick={onGenerateProtocol}
                            className="ml-1 p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Gerar novo protocolo"
                            type="button"
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">

                {/* Message Type Selector */}
                <div className="p-1 bg-gray-100/80 rounded-lg flex gap-1">
                    <button
                        type="button"
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${formData.messageType === 'meeting'
                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                        onClick={() => onChange('messageType', 'meeting')}
                    >
                        <Video size={16} /> Lembrete de Reunião
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${formData.messageType === 'certificate'
                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                        onClick={() => onChange('messageType', 'certificate')}
                    >
                        <CheckCircle size={16} /> Aprovação de Certificado
                    </button>
                </div>

                {/* Section 1: Client & Agent Data */}
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                        <User size={14} /> Dados do Atendimento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                placeholder="Ex: João Silva"
                                value={formData.clientName}
                                onChange={(e) => onChange('clientName', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Nome do Funcionário</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed outline-none text-sm font-medium"
                                placeholder="Ex: Maria"
                                value={formData.agentName}
                                readOnly
                            />
                        </div>
                        <div className="space-y-1.5 col-span-full md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">WhatsApp do Cliente</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className="text-gray-500 font-medium sm:text-sm">🇧🇷 +55</span>
                                </div>
                                <input
                                    type="tel"
                                    className="w-full pl-20 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                    placeholder="(11) 99999-9999"
                                    value={formData.clientPhone.replace(/^\+55\s?/, '')}
                                    onChange={(e) => {
                                        const cleanValue = e.target.value.replace(/^\+55\s?/, '');
                                        onChange('clientPhone', '+55 ' + cleanValue);
                                    }}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Meeting Info */}
                {formData.messageType === 'meeting' && (
                    <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={14} /> Dados da Reunião
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Data</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                    value={formData.meetingDate}
                                    onChange={(e) => onChange('meetingDate', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Horário (Brasília)</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                    value={formData.meetingTime}
                                    onChange={(e) => onChange('meetingTime', e.target.value)}
                                    required
                                />
                            </div>
                        </div>



                        {/* Link Configuration Section */}
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">

                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">Link da Reunião</label>
                            </div>

                            <div className="relative group">
                                <LinkIcon size={16} className="absolute left-3 top-3 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="url"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                    placeholder="Cole o link da reunião aqui..."
                                    value={formData.manualLink}
                                    onChange={(e) => onChange('manualLink', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 3: Sending Config & Template */}
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                        <FileText size={14} /> Personalização do Envio
                    </h3>

                    {/* Link Format Selection (Moved here to be available for both types) */}
                    <div className="mb-6 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Formato do Link</label>
                        {formData.actionButtonDisabled && (
                            <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                Botão de Ação bloqueado pelo administrador
                            </div>
                        )}
                        <div className="flex p-1 bg-gray-100 rounded-lg w-full md:w-fit">
                            <button
                                type="button"
                                disabled={formData.actionButtonDisabled}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${formData.actionButtonDisabled
                                    ? 'text-gray-400 cursor-not-allowed opacity-50'
                                    : formData.linkFormat === 'button'
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => !formData.actionButtonDisabled && onChange('linkFormat', 'button')}
                            >
                                Botão de Ação
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${(formData.linkFormat !== 'button' || formData.actionButtonDisabled) ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => onChange('linkFormat', 'text')}
                            >
                                Link no Texto
                            </button>
                        </div>
                    </div>

                    {/* Anti-Spam / Random Toggle */}
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-800">Proteção Anti-Bloqueio</h4>
                                <p className="text-xs text-emerald-600/80">Variar mensagem automaticamente</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.isRandomTemplate}
                                onChange={(e) => onChange('isRandomTemplate', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className={`space-y-1.5 col-span-full transition-opacity duration-200 ${formData.isRandomTemplate ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                            <label className="block text-sm font-medium text-gray-700">Modelo da Mensagem {formData.isRandomTemplate && <span className="text-emerald-600 font-bold ml-2">(Automático)</span>}</label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
                                    value={formData.selectedTemplateId}
                                    onChange={(e) => onChange('selectedTemplateId', e.target.value)}
                                >
                                    {currentTemplates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Custom Message Editor */}
                        <div className={`space-y-1.5 col-span-full transition-opacity duration-200 ${formData.isRandomTemplate ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                            <label className="block text-sm font-medium text-gray-700">Editar Mensagem</label>
                            <textarea
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-sans min-h-[120px]"
                                placeholder="Digite sua mensagem personalizada..."
                                value={formData.customMessage}
                                onChange={(e) => onChange('customMessage', e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                                Use <strong>{'{{time}}'}</strong> para o horário, <strong>{'{{link}}'}</strong> para o link de reunião e <strong>{'{{protocol}}'}</strong> para o código.
                            </p>
                        </div>

                        {/* Destination Field Removed as per user request (Fixed to Private) */}
                        {/* Date Scheduler Removed */}
                    </div>
                </section>

                {/* Webhook Config Moved to Settings Page */}

                {/* Compliance (Shows only for meeting?) The user text implies specific compliance. Sticking to meeting only for now, or updating text. User text already includes compliance info in the message itself, so maybe this compliance block is redundant?? 
            The current compliance block is "Regras de Compliance" displayed in the DASHBOARD, not the message. It's useful as a reminder for the admin. I will keep it but maybe only for 'meeting' mode.
        */}
                {formData.messageType === 'meeting' && (
                    <div className="bg-blue-50/80 p-4 rounded-lg border border-blue-100 text-sm text-blue-900 flex items-start gap-3">
                        <HelpCircle size={18} className="mt-0.5 shrink-0 text-blue-600" />
                        <div>
                            <p className="font-bold mb-1 text-blue-800">Regras de Compliance</p>
                            <ul className="list-disc list-inside space-y-1 text-xs opacity-90 text-blue-700/80">
                                <li>Ambiente silencioso obrigatório.</li>
                                <li>Utilizar fundo neutro/claro na câmera.</li>
                                <li>Tolerância máxima de atraso: 8 minutos.</li>
                            </ul>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSending}
                    className="relative w-full py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transform transition-all flex items-center justify-center gap-3 group text-sm uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                    {isSending ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Enviando...</span>
                        </>
                    ) : (
                        <>
                            <span>{formData.messageType === 'meeting' ? 'Agendar Lembrete' : 'Agendar Envio de Certificado'}</span>
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-1 transition-transform"><path d="M3.33334 8H12.6667M12.6667 8L8.00001 3.33333M12.6667 8L8.00001 12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </>
                    )}
                </button>

            </form>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transform transition-all animate-in slide-in-from-right duration-300 ${toast.type === 'success'
                    ? 'bg-gray-900 border border-green-500/30 text-white'
                    : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-100 text-red-600'}`}>
                        {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm ${toast.type === 'success' ? 'text-white' : 'text-red-900'}`}>
                            {toast.type === 'success' ? 'Sucesso!' : 'Erro no Envio'}
                        </h4>
                        <p className={`text-xs ${toast.type === 'success' ? 'text-gray-300' : 'text-red-700'}`}>
                            {toast.message}
                        </p>
                    </div>
                    <button
                        onClick={() => setToast({ ...toast, show: false })}
                        className={`ml-4 p-1 rounded-full hover:bg-white/10 ${toast.type === 'success' ? 'text-gray-400 hover:text-white' : 'text-red-400 hover:text-red-600'}`}
                    >
                        <XCircle size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DashboardForm;

