# Chinezlanches - Dev Server

Este repositório contém um frontend estático em `Frontend/` e um servidor Node/Express simples (`server.js`) usado para desenvolvimento local. O servidor expõe APIs para anexar inscrições, contatos e solicitações de contratação a arquivos JSON na pasta `Frontend/`.

## Como rodar localmente
1. Instale dependências (uma vez):

```powershell
npm install
```

2. Defina a senha administrativa (recomendado):

```powershell
$env:ADMIN_PASSWORD = 'uma_senha_forte_aqui'
```

Se você não definir `ADMIN_PASSWORD`, o servidor gerará uma senha temporária na saída do console para este processo (apenas para conveniência em desenvolvimento). Ainda assim, é recomendado sempre definir uma senha forte.

3. Inicie o servidor:

```powershell
npm start
```

O servidor por padrão roda em `http://localhost:3000`. Para alterar a porta, defina a variável `PORT` antes de iniciar.

## Endpoints úteis
- POST `/api/inscricao` — recebe JSON com campos como `nome`, `telefone`, `email`, `bairro`, `tipo_participacao`, `observacoes`. As submissões são anexadas em `Frontend/inscricoes.json`.
- POST `/api/contato` — recebe `nome`, `email`, `mensagem` e salva em `Frontend/contatos.json`.
- POST `/api/contratacao` — recebe `nomeContratante`, `emailContratante`, `telefoneContratante`, `detalhes` e salva em `Frontend/contratacoes.json`.

### Painel administrativo
- Acesse `/admin` para abrir o painel administrativo (requer login).
- Página de login está em `/admin-login.html`.

## Armazenamento
Os dados são salvos em arquivos JSON dentro da pasta `Frontend/`:
- `Frontend/inscricoes.json`
- `Frontend/contatos.json`
- `Frontend/contratacoes.json`

O servidor garante que estes arquivos existam e sejam arrays vazios ao iniciar.

## Segurança (recomendações)
- Não use o servidor deste repositório em produção sem melhorias de segurança.
- Defina `ADMIN_PASSWORD` via variável de ambiente antes de iniciar o servidor.
- Use HTTPS em produção e configure cookies com `Secure` e `SameSite` apropriados.
- Para produção, prefira um banco de dados e uma store de sessão persistente (por exemplo Redis).

## Utilitários incluídos
- O servidor tenta corrigir arquivos JSON corrompidos inicializando-os como `[]` quando necessário.

## Se algo falhar
- Verifique os logs do servidor ao iniciar; mensagens sobre senha temporária ou criação de arquivos são exibidas.
- Se quiser que eu adicione export CSV, email de notificação, ou autenticação/admin mais forte (bcrypt, usuários), posso implementar essas melhorias.
