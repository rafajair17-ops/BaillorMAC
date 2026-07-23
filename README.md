# Bot de tickets — Mecânica Bennys

O bot recebe o JPG criado pela calculadora e publica no canal configurado.

1. Crie um bot em https://discord.com/developers/applications, copie o token e convide-o para o servidor com permissão de enviar mensagens e anexar arquivos.
2. Copie `.env.example` para `.env` e preencha o token, o ID do canal e a URL publicada no Netlify.
3. No terminal desta pasta, rode `npm install` e depois `npm start`.
4. Hospede esta pasta em um serviço Node (Render, Railway ou VPS). A URL final deverá ficar parecida com `https://seu-bot.onrender.com/api/tickets`.
5. Copie a URL final para `mecanica-bennys/discord-config.js` em `window.BENNYS_DISCORD_ENDPOINT`.

Não coloque o token do Discord no site Netlify. Ele fica somente no `.env` do bot.
