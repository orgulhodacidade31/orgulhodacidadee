(function(){
  const msgsEl = document.getElementById('messages');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send');
  const usernameInput = document.getElementById('username');
  const saveUsernameBtn = document.getElementById('save-username');
  const changeUsernameBtn = document.getElementById('change-username');
  const usernameContainer = document.getElementById('username-container');
  const usernameDisplay = document.getElementById('username-display');
  const currentUsername = document.getElementById('current-username');
  
  // Função para atualizar a interface após definir o nome
  function updateUsernameUI(username) {
    if (username) {
      usernameContainer.style.display = 'none';
      usernameDisplay.style.display = 'block';
      currentUsername.textContent = username;
      input.focus(); // Foca no campo de mensagem
      try { 
        localStorage.setItem('chat_username', username);
      } catch(e) { /* ignore */ }
    } else {
      usernameContainer.style.display = 'flex';
      usernameDisplay.style.display = 'none';
      usernameInput.focus();
    }
  }

  // Tenta carregar nome salvo anteriormente
  try {
    const savedName = localStorage.getItem('chat_username');
    if (savedName) {
      usernameInput.value = savedName;
      updateUsernameUI(savedName);
    }
  } catch(e) { /* ignore */ }
  
  // Evento para salvar nome
  saveUsernameBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
      updateUsernameUI(username);
    } else {
      alert('Por favor, digite seu nome');
      usernameInput.focus();
    }
  });

  // Evento para alterar nome
  changeUsernameBtn.addEventListener('click', () => {
    updateUsernameUI(''); // Limpa e mostra input
  });

  // Permite salvar nome com Enter
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveUsernameBtn.click();
    }
  });

  function appendMessage(text, role){
    const d = document.createElement('div');
    d.className = 'msg ' + (role === 'user' ? 'user' : 'assistant');
    d.textContent = text;
    // Inline styles to ensure consistent look when embedded
    d.style.maxWidth = '75%';
    d.style.padding = '0.5rem 0.75rem';
    d.style.borderRadius = '8px';
    d.style.fontSize = '0.95rem';
    d.style.lineHeight = '1.2';
    d.style.wordBreak = 'break-word';
    if (role === 'user'){
      d.style.alignSelf = 'flex-end';
      d.style.background = '#e6f0ff';
      d.style.color = '#0b2545';
    } else {
      d.style.alignSelf = 'flex-start';
      d.style.background = '#f4f4f6';
      d.style.color = '#111';
    }
    msgsEl.appendChild(d);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  // Real-time chat using WebSocket: broadcasted to all connected clients
  let ws;
  function setupWebSocket(){
    try{
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${location.host}`;
      ws = new WebSocket(url);

      ws.addEventListener('open', ()=>{
        console.log('WebSocket conectado');
        sendBtn.disabled = false;
      });

      ws.addEventListener('message', (ev)=>{
        try{
          const obj = JSON.parse(ev.data);
          if(obj.type === 'chat'){
            // role 'assistant' can come from server; otherwise treat as user
            const role = obj.role === 'assistant' ? 'assistant' : 'user';
            appendMessage(`${obj.user}: ${obj.text}`, role);
          }
        }catch(e){ console.error('WS parse error', e); }
      });

      ws.addEventListener('close', ()=>{ console.log('WebSocket fechado'); sendBtn.disabled = true; });
      ws.addEventListener('error', (e)=>{ console.error('WebSocket erro', e); sendBtn.disabled = true; });
    }catch(e){ console.error('Falha ao conectar WS', e); }
  }

  async function sendMessage(){
    const text = input.value.trim();
    if(!text) return;
    input.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = 'Enviando...';

    // Verifica se nome foi definido
    const username = currentUsername.textContent || 'Anônimo';
    if (username === 'Anônimo') {
      alert('Por favor, defina seu nome primeiro');
      updateUsernameUI('');
      return;
    }
    
    const payload = { type: 'chat', user: username, text };

    // send over websocket
    try{
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      } else {
        appendMessage('Conexão não disponível. Tente recarregar a página.', 'assistant');
      }
    }catch(e){
      appendMessage('Erro ao enviar mensagem: ' + e.message, 'assistant');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Enviar';
    }
  }

  // Initialize websocket when chat loads
  setupWebSocket();

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); } });

// Chat sidebar toggle (works when embedded in index.html)
try{
  const sidebar = document.getElementById('chat-sidebar');
  const toggle = document.getElementById('chat-toggle');
  if (sidebar && toggle) {
    toggle.addEventListener('click', ()=>{
      sidebar.style.display = 'none';
      // show open button
      let openBtn = document.getElementById('chat-open-btn');
      if (!openBtn) {
        openBtn = document.createElement('button');
        openBtn.id = 'chat-open-btn';
        openBtn.textContent = 'Chat';
        openBtn.style.position = 'fixed';
        openBtn.style.left = '6px';
        openBtn.style.top = '50%';
        openBtn.style.transform = 'translateY(-50%)';
        openBtn.style.zIndex = '100000';
        openBtn.style.background = 'var(--cor-destaque,#2c7be5)';
        openBtn.style.color = '#fff';
        openBtn.style.border = 'none';
        openBtn.style.padding = '8px 10px';
        openBtn.style.borderRadius = '6px';
        openBtn.style.cursor = 'pointer';
        document.body.appendChild(openBtn);
        openBtn.addEventListener('click', ()=>{
          sidebar.style.display = 'flex';
          openBtn.remove();
          input.focus();
        });
      }
    });
  }
} catch(e) { /* ignore when not embedded */ }

})();