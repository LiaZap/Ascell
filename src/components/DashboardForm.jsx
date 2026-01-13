import { Calendar, Clock, Link as LinkIcon, User, Settings, HelpCircle, FileText, CheckCircle, Video, Shield, Loader2 } from 'lucide-react';
import { MEETING_TEMPLATES, CERTIFICATE_TEMPLATES } from '../data/templates';
import { useState, useEffect } from 'react';

const DashboardForm = ({ formData, onChange }) => {
    const [isSending, setIsSending] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.webhookUrl) {
            alert('Por favor, configure a URL do Webhook na aba Configurações.');
            return;
        }

        setIsSending(true);
        let finalPayload = { ...formData };

        // Random Selection Logic if enabled
        if (formData.isRandomTemplate) {
            const randomIndex = Math.floor(Math.random() * currentTemplates.length);
            const randomTemplate = currentTemplates[randomIndex];
            finalPayload.selectedTemplateId = randomTemplate.id;
            finalPayload.customMessage = randomTemplate.text; // Ensure message matches template
            console.log(`[Anti-Spam] Selected Random Template: ${randomTemplate.id}`);
        }

        try {
            console.log('Sending Payload:', JSON.stringify(finalPayload, null, 2));

            const response = await fetch(formData.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalPayload),
            });

            if (response.ok) {
                alert('Sucesso! Dados enviados para o agente.');
            } else {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Webhook Error:', error);
            alert(`Falha ao enviar: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-[var(--color-bg-card)] rounded-xl shadow-lg border border-gray-100/50 overflow-hidden text-gray-800">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                        <Settings size={20} className="text-primary" />
                        Configuração do Agente
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Personalize as mensagens e configurações de envio.</p>
                </div>
                <div className="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">
                    Protocolo: <span className="font-bold text-gray-900 ml-1">{formData.protocolCode}</span>
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
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                placeholder="Ex: Maria"
                                value={formData.agentName}
                                onChange={(e) => onChange('agentName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5 col-span-full md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">WhatsApp do Cliente</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                placeholder="+55 (11) 99999-9999"
                                value={formData.clientPhone}
                                onChange={(e) => onChange('clientPhone', e.target.value)}
                                required
                            />
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

                                {/* Moved Toggle Here */}
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-gray-500 cursor-pointer select-none" onClick={() => onChange('isAutoLink', !formData.isAutoLink)}>
                                        Gerar Automático
                                    </label>
                                    <button
                                        type="button"
                                        className={`w-9 h-5 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/40 ${formData.isAutoLink ? 'bg-primary' : 'bg-gray-300'}`}
                                        onClick={() => onChange('isAutoLink', !formData.isAutoLink)}
                                    >
                                        <span className={`block w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform duration-200 ${formData.isAutoLink ? 'translate-x-4' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative group">
                                <LinkIcon size={16} className={`absolute left-3 top-3 transition-colors ${formData.isAutoLink ? 'text-gray-400' : 'text-gray-500 group-focus-within:text-primary'}`} />
                                <input
                                    type="url"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all outline-none text-sm ${formData.isAutoLink
                                        ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed select-none'
                                        : 'bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                                        }`}
                                    placeholder="https://meet.google.com/..."
                                    value={formData.isAutoLink && formData.protocolCode ? `https://ar.syngularid.com.br/videoconferencia?protocolo=${formData.protocolCode}` : formData.manualLink}
                                    onChange={(e) => onChange('manualLink', e.target.value)}
                                    disabled={formData.isAutoLink}
                                    required={!formData.isAutoLink}
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
                        <div className="flex p-1 bg-gray-100 rounded-lg w-full md:w-fit">
                            <button
                                type="button"
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${formData.linkFormat !== 'button' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => onChange('linkFormat', 'text')}
                            >
                                Link no Texto
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${formData.linkFormat === 'button' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => onChange('linkFormat', 'button')}
                            >
                                Botão de Ação
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
                        <div className="space-y-1.5 col-span-full">
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
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Agendar Data</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                value={formData.scheduleDate}
                                onChange={(e) => onChange('scheduleDate', e.target.value)}
                            />
                        </div>
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
                    className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark hover:shadow-xl hover:-translate-y-0.5 transform transition-all flex items-center justify-center gap-2 group text-sm uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSending ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Enviando...</span>
                        </>
                    ) : (
                        <>
                            <span>{formData.messageType === 'meeting' ? 'Agendar Lembrete' : 'Agendar Envio de Certificado'}</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-1 transition-transform"><path d="M3.33334 8H12.6667M12.6667 8L8.00001 3.33333M12.6667 8L8.00001 12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </>
                    )}
                </button>

            </form>
        </div>
    );
};

export default DashboardForm;
