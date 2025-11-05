# Guia rápido de deploy (Frontend + Backend)

Este arquivo mostra formas simples de publicar o site completo (frontend estático em `Frontend/` + servidor Node em `server.js`) para que seus amigos possam acessá-lo.

Observações importantes antes de escolher:
- O servidor grava em arquivos dentro de `Frontend/` (inscricoes/contatos/contratacoes). Alguns hosts serverless não mantêm gravações em disco entre deploys ou reinícios. Para dados persistentes, prefira um serviço que execute um processo sempre-on com disco persistente ou migre para um banco de dados.
- WebSocket (chat) e APIs de longa duração exigem um processo Node persistente (não funcionam em funções serverless sem suporte a conexões persistentes).
- Defina variáveis de ambiente: `ADMIN_PASSWORD` (recomendado) e opcionalmente `OPENAI_API_KEY` para o chat com OpenAI.

Opções rápidas e passos resumidos

1) Deploy rápido e simples (recomendado para demo): Railway / Render / Fly
   - Crie um repositório no GitHub com este projeto (se ainda não tiver).
   - Conecte o GitHub ao Railway/Render/Fly e crie um novo serviço "web" a partir do repositório.
   - Configure variáveis de ambiente no painel do serviço:
     - `ADMIN_PASSWORD` = uma_senha_forte
     - (opcional) `OPENAI_API_KEY` = sk-...
   - Build command: (geralmente automático) `npm install`
   - Start command: `npm start`
   - Porta: A maioria dos provedores usa a env var `PORT`; o `server.js` respeita `process.env.PORT`.
   - Após algumas instâncias, você receberá uma URL pública. Compartilhe com os amigos.

2) Deploy via Docker (Fly.io / Render / DigitalOcean Apps)
   - Já incluí um `Dockerfile` e um `Procfile` neste repositório.
   - Fly.io (exemplo):
     - Instale `flyctl`, faça `flyctl launch` na pasta do projeto e depois `flyctl deploy`.
     - Defina `ADMIN_PASSWORD` com `flyctl secrets set ADMIN_PASSWORD=...`.
   - Render: crie um novo Web Service a partir do GitHub, selecione Docker como ambiente ou deixe que o Render detecte `package.json`.

3) Deploy rápido para teste (menos estável): Replit ou Glitch
   - Importe o repositório para Replit.
   - Configure o comando de execução como `npm start` e adicione `ADMIN_PASSWORD` nas Secrets.
   - Replit fornece uma URL pública (bom para mostrar, não ideal para produção).

4) Somente frontend público (se você não precisa do backend funcionando)
   - Use GitHub Pages para publicar `Frontend/` (grátis).
   - Limitação: APIs e WebSocket não estarão disponíveis; apenas conteúdo estático será servido.

Passos detalhados recomendados (Railway — mais simples para iniciantes):
1. Push do repositório para GitHub.
2. Criar conta em https://railway.app/ e conectar seu GitHub.
3. Criar novo projeto -> Deploy from GitHub -> selecione o repositório.
4. Em Settings do serviço -> Environment Variables, adicione `ADMIN_PASSWORD` (obrigatório) e `OPENAI_API_KEY` se quiser o chat.
5. Verifique logs e aguarde deploy. Quando estiver pronto, você terá uma URL pública.

Se preferir, eu posso:
- Gerar um `docker-compose.yml` para facilitar testes locais e deploy em VPS.
- Criar um GitHub Action para build e deploy automático (por exemplo, para Fly ou para uma imagem Docker-registry).
- Ajudar a conectar o repositório ao Railway/Fly/Render (vou precisar que você dê permissões ou execute os passos finais).

Problemas comuns e como resolver
- Erro 500 em `/api/chat`: verifique se `OPENAI_API_KEY` está configurada.
- Não consegue logar no admin: defina `ADMIN_PASSWORD` nas env vars; o servidor gera uma senha temporária apenas localmente.
- Dados não persistem após reiniciar o serviço: migre para um banco de dados (posso ajudar a adaptar para SQLite/Postgres) ou escolha um serviço com volume persistente.

Próximo passo que eu posso executar agora:
- Criar `docker-compose.yml` para você testar localmente e facilitar deploy em VPS; ou
- Gerar um workflow GitHub Action para construir e empurrar imagem Docker para o Docker Hub; ou
- Ajudar você passo-a-passo a conectar o repositório ao Railway (vou descrever cada clique).

Diga qual opção prefere e eu sigo com as instruções concretas.
