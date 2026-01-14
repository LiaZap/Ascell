import { Signal, Battery, Wifi, Video, Phone, MoreVertical, Paperclip, Send, User, FileText, CheckCircle, Calendar } from 'lucide-react';
import { MEETING_TEMPLATES, CERTIFICATE_TEMPLATES } from '../data/templates';

const MobilePreview = ({ formData }) => {

    // 1. Get current time
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // 2. Logic to generate the link
    const CERTIFICATE_LINK = 'https://mp.syngularid.com.br/protocol/emissao';

    const finalLink = formData.messageType === 'certificate'
        ? CERTIFICATE_LINK
        : (formData.manualLink || 'https://ar.syngularid.com.br/...');

    // 3. Find template
    const templates = formData.messageType === 'meeting' ? MEETING_TEMPLATES : CERTIFICATE_TEMPLATES;
    const selectedTemplate = templates.find(t => t.id === formData.selectedTemplateId) || templates[0];

    // 4. Process text
    const processTemplate = (text) => {
        let processed = text;

        // Handle Link Format
        if (formData.linkFormat === 'button') {
            // If button mode, remove the raw link from text and add a call-to-action
            processed = processed.replace(/{{link}}/g, '\n👉 *Clique no botão abaixo para acessar*');
        } else {
            // Normal text link
            processed = processed.replace(/{{link}}/g, finalLink);
        }

        processed = processed.replace(/{{time}}/g, formData.meetingTime || '--:--');
        processed = processed.replace(/{{protocol}}/g, formData.protocolCode);
        processed = processed.replace(/{{agentName}}/g, formData.agentName || 'Atendente');
        processed = processed.replace(/{{clientName}}/g, formData.clientName || 'Cliente');
        processed = processed.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');
        processed = processed.replace(/~(.*?)~/g, '<del>$1</del>');
        return processed;
    };

    // Use customMessage if available, fallback to template text
    const messageContent = processTemplate(formData.customMessage || selectedTemplate.text);

    return (
        <div className="w-[320px] h-[800px] shrink-0 bg-gray-900 rounded-[40px] border-8 border-gray-800 shadow-2xl relative overflow-hidden font-sans select-none ring-4 ring-gray-900/50 flex flex-col">

            {/* Phone Stats Bar */}
            <div className="absolute top-0 left-0 right-0 h-7 bg-transparent z-20 flex justify-between items-center px-6 pt-2 text-white text-[10px] font-medium">
                <span>{timeString}</span>
                <div className="flex items-center gap-1.5 opacity-90">
                    <Signal size={12} strokeWidth={2.5} />
                    <Wifi size={12} strokeWidth={2.5} />
                    <Battery size={12} strokeWidth={2.5} />
                </div>
            </div>

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20" />

            {/* WhatsApp Header (Client Name) */}
            <div className="bg-[#075E54] pt-8 pb-3 px-3 flex items-center justify-between text-white shadow-sm z-10 relative shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm border-2 border-white/20 overflow-hidden">
                        <User size={20} className="text-gray-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold leading-tight">{formData.clientName || 'Cliente'}</h3>
                        <p className="text-[10px] opacity-80">visto por último hoje às {timeString}</p>
                    </div>
                </div>
                <div className="flex gap-4 pr-1">
                    <Video size={18} />
                    <Phone size={18} />
                    <MoreVertical size={18} />
                </div>
            </div>

            {/* Wallpaper */}
            <div className="absolute inset-0 bg-[#E5DDD5] -z-10 opacity-90" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

            {/* Chat Area */}
            <div className="p-3 flex-1 overflow-y-auto pb-20 flex flex-col relative no-scrollbar">

                {/* Encryption Notice */}
                <div className="bg-[#FFF3C2] text-[#555] p-2 rounded-lg text-[10px] text-center shadow-sm mb-4 mx-4">
                    As mensagens e as chamadas são protegidas com a criptografia de ponta a ponta.
                </div>

                {/* Sent Message Bubble (Agent View -> Centered) */}
                <div className={`bg-[#d9fdd3] rounded-lg shadow-sm max-w-[95%] p-1 self-center relative text-sm text-gray-800 mb-2 ${formData.linkFormat === 'button' ? 'pb-0 rounded-b-lg' : ''}`}>

                    {/* Message Content */}
                    <div className="px-2 pt-2 pb-1 whitespace-pre-wrap leading-relaxed break-words" dangerouslySetInnerHTML={{
                        __html: (formData.agentName ? `<strong>${formData.agentName}</strong><br/><br/>` : '') + messageContent
                    }} />



                    {/* Metadata (Time + Ticks) */}
                    <div className="text-[9px] text-gray-500 text-right pr-1 pb-1 flex justify-end items-center gap-1">
                        <span className="opacity-70">{timeString}</span>
                        {/* Read Receipt (Double Tick Blue) */}
                        <div className="flex -space-x-1">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#53bdeb]"><path d="M11.5 5.5L7.5 10.5L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 5.5L11 10.5M10 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>

                    {/* BUTTON SIMULATION (If Button Mode) */}
                    {formData.linkFormat === 'button' && (
                        <div className="border-t border-black/5 mt-1 -mx-1">
                            <div className="py-2 px-4 flex items-center justify-center gap-2 text-[#00a884] font-semibold cursor-pointer hover:bg-black/5 transition-colors border-b border-black/5 last:border-0 last:rounded-b-lg">
                                {formData.messageType === 'meeting' ? <Video size={16} /> : <CheckCircle size={16} />}
                                {formData.messageType === 'meeting' ? 'Acessar Reunião' : 'Emitir Certificado'}
                            </div>
                            {formData.messageType === 'meeting' && (
                                <div className="py-2 px-4 flex items-center justify-center gap-2 text-[#00a884] font-semibold cursor-pointer hover:bg-black/5 transition-colors rounded-b-lg">
                                    <Calendar size={16} />
                                    Reagendar Reunião
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Footer / Input */}
            <div className="absolute bottom-3 left-2 right-2 flex items-end gap-2 z-20">
                <div className="flex-1 bg-white rounded-full p-2 pl-4 flex items-center justify-between shadow-sm">
                    <span className="text-gray-400 text-sm">Mensagem</span>
                    <div className="flex gap-3 text-gray-500 pr-2">
                        <Paperclip size={18} />
                    </div>
                </div>
                <div className="w-10 h-10 bg-[#008f79] rounded-full flex items-center justify-center text-white shadow-md">
                    <Send size={18} className="translate-x-0.5 translate-y-0.5" />
                </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full opacity-50 z-20"></div>

        </div>
    );
};

export default MobilePreview;
