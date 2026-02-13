# Guia de Deploy no Easypanel

Como o código já está atualizado no GitHub, siga estes passos para atualizar o sistema no Easypanel:

## 1. Acesse o Easypanel

Faça login no seu painel do Easypanel.

## 2. Navegue até o Projeto

Encontre o projeto **AScell** (ou o nome que você definiu para o serviço).

## 3. Verifique as Variáveis de Ambiente

Antes de refazer o deploy, certifique-se de que as variáveis de ambiente necessárias estejam configuradas na aba **Environment** ou **Settings** > **Environment Variables**.

As principais variáveis são:

- `DATABASE_URL`: A string de conexão com o banco de dados PostgreSQL.
- `JWT_SECRET`: Uma chave secreta para a autenticação (pode ser qualquer string longa e aleatória).
- `PORT`: (Opcional, geralmente o Easypanel define, mas o app usa 3000 por padrão).

## 4. Dispare o Deploy (Rebuild)

Como o código novo já está no Git, você precisa forçar uma nova construção:

1. Vá até a aba **Deployments** ou **Overview**.
2. Clique no botão **Deploy** ou **Rebuild** (às vezes aparece como um ícone de "play" ou "setas circulares").
3. Selecione a opção **"Redeploy without cache"** (se disponível) para garantir que todas as dependências sejam atualizadas, mas um deploy normal geralmente já funciona.

## 5. Acompanhe os Logs

Vá para a aba **Logs** (Build Logs e depois App Logs) para verificar se:

- O build do Docker completou com sucesso ("Successfully built ...").
- O servidor iniciou corretamente ("Server running on port 3000").
- A conexão com o banco de dados foi estabelecida ("Database tables verified/created successfully").

## Solução de Problemas Comuns

- **Erro "Failed to clone repository"**:
  1. **Verifique o Ramo (Branch)**: Certifique-se de que está usando `master` (nosso padrão) e não `main`.
  2. **Repositório Privado**: Se o repo for privado, você precisa de um Token. Gere um em (GitHub Settings > Developer Settings > Personal access tokens) e use a URL: `https://SEU_TOKEN@github.com/LiaZap/Ascell.git`.

- **404 Not Found (Frontend)**: Se o site abrir mas der erro ao navegar, verifique se o arquivo `nginx.conf` foi copiado corretamente (o Dockerfile.frontend faz isso).

- **Erro de Conexão na API**: Se os dados não carregarem, abra o Console do navegador (F12) e veja se o frontend está tentando conectar na URL certa (`VITE_API_URL`).

- **Erro de Memória:** Se o build falhar, tente aumentar temporariamente a memória RAM alocada para o build.
