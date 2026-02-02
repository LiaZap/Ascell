export const MEETING_TEMPLATES = [
    {
        id: 'v1',
        name: 'Versão 1 – Padrão',
        text: `Olá *{{clientName}}*, me chamo *{{agentName}}* da Videoconferência do Grupo ASCEL.

📅 Atendimento: {{dynamicDate}} às {{time}} (horário de Brasília)

🔗 Link de acesso:
{{link}}

👉 Clique em "prosseguir" e informe o código enviado por SMS e e-mail.

📌 Importante:
• Local silencioso
• Fundo neutro obrigatório
• Tolerância de atraso: 8 minutos

Confirma nosso atendimento?`
    },
    {
        id: 'v2',
        name: 'Versão 2 – Lista Numerada',
        text: `Olá *{{clientName}}*, aqui é *{{agentName}}* da equipe de Videoconferência do Grupo ASCEL 😊

1️⃣ Atendimento marcado para {{dynamicDate}} às {{time}} (horário de Brasília)

2️⃣ Para acessar a reunião:
{{link}}

→ Clique em "prosseguir" e informe o código recebido por SMS e e-mail

3️⃣ Antes do atendimento, atenção:
✔ Local silencioso
✔ Fundo neutro obrigatório
✔ Tolerância de atraso: 8 minutos

Podemos confirmar sua presença?`
    },
    {
        id: 'v3',
        name: 'Versão 3 – Compacto',
        text: `Olá *{{clientName}}*, me chamo *{{agentName}}* da Videoconferência do Grupo ASCEL.

📅 Atendimento: {{dynamicDate}} às {{time}} (horário de Brasília)

🔗 Link de acesso:
{{link}}

👉 Clique em "prosseguir" e informe o código enviado por SMS e e-mail.

📌 Importante:
• Local silencioso
• Fundo neutro obrigatório
• Tolerância de atraso: 8 minutos

Confirma nosso atendimento?`
    },
    {
        id: 'v4',
        name: 'Versão 4 – Separadores',
        text: `Olá *{{clientName}}*, aqui é *{{agentName}}* da equipe de Videoconferência do Grupo ASCEL.

────────────
📅 *Horário do atendimento*
{{dynamicDate}} às {{time}} (horário de Brasília)
────────────

🔗 *Link da reunião*
{{link}}

👉 Clique em "prosseguir" e informe o código enviado por SMS e e-mail.

📌 *Orientações*
• Ambiente silencioso
• Fundo neutro (parede lisa)
• Tolerância de atraso: 8 minutos

Podemos confirmar?`
    },
    {
        id: 'v5',
        name: 'Versão 5 – Pergunta e Resposta',
        text: `Olá *{{clientName}}*, sou *{{agentName}}* e serei responsável por realizar a sua Videoconferência.

❓ *Quando é o atendimento?*
📅 {{dynamicDate}} às {{time}} (horário de Brasília)

❓ *Como acessar?*
🔗 {{link}}

👉 Clique em "prosseguir" e use o código enviado por SMS e e-mail.

❗ *Atenção:*
• Local silencioso
• Fundo neutro obrigatório
• Tolerância de atraso: 8 minutos

Podemos confirmar o atendimento?`
    },
    {
        id: 'v6',
        name: 'Versão 6 – Visual (com Nome)',
        text: `Olá *{{clientName}}*, sou *{{agentName}}* agente de vídeo conferência responsável pelo seu atendimento.

📞 *Videoconferência | Grupo ASCEL*
🕒 {{dynamicDate}} às {{time}} (horário de Brasília)

🔗 *Acesso*
{{link}}

👉 Clique em "prosseguir"
👉 Informe o código recebido por SMS e e-mail

📌 *Para um atendimento tranquilo:*
✔ Local silencioso
✔ Fundo neutro (parede lisa)
✔ Atraso permitido: até 8 minutos

Confirma o atendimento?`
    },
    {
        id: 'v7',
        name: 'Versão 7 – Direto',
        text: `Olá *{{clientName}}*, meu nome é *{{agentName}}*, sou da equipe de Videoconferência do Grupo ASCEL.

📅 Atendimento agendado para {{dynamicDate}} às {{time}} (horário de Brasília).

🔗 Acesse pelo link:
{{link}}

👉 Clique em "prosseguir" e informe o código enviado por SMS e e-mail.

📌 Requisitos:
• Local silencioso
• Fundo neutro obrigatório
• Tolerância de atraso: 8 minutos

Podemos confirmar?`
    },
    {
        id: 'v8',
        name: 'Versão 8 – Destaque',
        text: `Olá *{{clientName}}*, aqui é *{{agentName}}* da equipe de Videoconferência do Grupo ASCEL.

⭐ *Atendimento de {{dynamicDate}}*
🕒 {{time}} (horário de Brasília)

🔗 *Link da reunião*
{{link}}

👉 Selecione "prosseguir"
👉 Informe o código enviado por SMS e e-mail

📌 *Atenção*
• Ambiente silencioso
• Fundo neutro (parede lisa) obrigatório
• Tolerância de atraso: 8 minutos

Podemos confirmar nosso atendimento?`
    }
];

export const CERTIFICATE_TEMPLATES = [
    {
        id: 'c1',
        name: 'Modelo 1 – Padrão',
        text: `🎉 *PARABÉNS *{{clientName}}*!*
Seu certificado foi APROVADO ✅
{{a1Warning}}

🔗 Link para emissão do certificado:
{{link}}

📄 Protocolo: {{protocol}}

🔑 Código de Emissão: {{emissionCode}}
{{feedbackSection}}

Agradecemos a confiança 🚀
*{{agentName}}* - Grupo ASCEL`
    },
    {
        id: 'c2',
        name: 'Modelo 2 – Curto',
        text: `✅ Certificado aprovado com sucesso!

Olá *{{clientName}}*,
{{a1Warning}}

➡️ Emissão do certificado:
{{link}}

➡️ Protocolo: {{protocol}}

🔑 Código de Emissão: {{emissionCode}}
{{feedbackSection}}

Obrigado pela confiança 🚀
Att, *{{agentName}}*`
    },
    {
        id: 'c3',
        name: 'Modelo 3 – Visual',
        text: `🎉 Parabéns *{{clientName}}*! Seu certificado foi aprovado ✅
{{a1Warning}}

🔗 Acesse para emitir:
{{link}}

📌 Protocolo: {{protocol}}

🔑 Código de Emissão: {{emissionCode}}
{{feedbackSection}}

Agradecemos a confiança 🚀
*{{agentName}}*`
    },
    {
        id: 'c4',
        name: 'Modelo 4 – Separadores',
        text: `🎊 *CERTIFICADO APROVADO* ✅

───────────────
Olá *{{clientName}}*,
{{a1Warning}}
───────────────

🔗 Link de emissão:
{{link}}

📄 Protocolo: {{protocol}}

🔑 Código de Emissão: {{emissionCode}}
{{feedbackSection}}

Obrigado por confiar em nosso serviço 🚀
Atenciosamente, *{{agentName}}*`
    },
    {
        id: 'c5',
        name: 'Modelo 5 – Passos',
        text: `🎉 Parabéns *{{clientName}}*! Seu certificado foi aprovado ✅
{{a1Warning}}

📌 *Como emitir:*
1️⃣ Acesse o link abaixo
2️⃣ Utilize o protocolo informado
3️⃣ Use o código de emissão

🔗 {{link}}

📄 Protocolo: {{protocol}}

🔑 Código de Emissão: {{emissionCode}}
{{feedbackSection}}

Agradecemos a confiança 🚀
*{{agentName}}*`
    },
    {
        id: 'c6',
        name: 'Modelo 6 – Objetivo',
        text: `✅ Seu certificado foi aprovado com sucesso!

Olá *{{clientName}}*,
{{a1Warning}}

🔗 Link de acesso:
{{link}}

📌 Protocolo: {{protocol}}

🔑 Código de Emissão: {{emissionCode}}
{{feedbackSection}}

Obrigado pela confiança 🚀
Att, *{{agentName}}*`
    },
    {
        id: 'c7',
        name: 'Modelo 7 – Acolhedor',
        text: `Olá *{{clientName}}*! 😊

Temos uma ótima notícia:
🎉 Seu certificado foi APROVADO ✅
{{a1Warning}}

🔗 Emissão do certificado:
{{link}}

📄 Protocolo: {{protocol}}

🔑 Código de Emissão: {{emissionCode}}
{{feedbackSection}}

Agradecemos a confiança 🚀
Com carinho, *{{agentName}}*`
    },
    {
        id: 'c8',
        name: 'Modelo 8 – Destaque',
        text: `⭐ *PARABÉNS *{{clientName}}*!*
Seu certificado foi APROVADO ✅
{{a1Warning}}

🔗 Link de emissão:
{{link}}

📌 Protocolo: {{protocol}}

🔑 Código de Emissão: {{emissionCode}}
{{feedbackSection}}

Obrigado pela confiança 🚀
*{{agentName}}* - Atendimento`
    }
];
