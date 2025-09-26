const chat = document.querySelector('#chat');
const input = document.querySelector('#input');
const botaoEnviar = document.querySelector('#botao-enviar');
const botaoLimpar = document.querySelector('#botao-limpar-conversa');
const sugestoes = document.querySelector('#sugestoes');
const typing = document.querySelector('#typing');

botaoEnviar.addEventListener('click', enviarMensagem);
botaoLimpar.addEventListener('click', limparConversa);

// Enter envia • Shift+Enter quebra linha
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    botaoEnviar.click();
  }
});

// Chips de sugestão
if (sugestoes) {
  sugestoes.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-msg]');
    if (!btn) return;
    input.value = btn.dataset.msg;
    botaoEnviar.click();
  });
}

document.addEventListener('DOMContentLoaded', vaiParaFinalDoChat);

function getSessionId() {
  let sid = localStorage.getItem('sid');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('sid', sid);
  }
  return sid;
}

function setTyping(flag) {
  if (!typing) return;
  typing.hidden = !flag;
  chat.setAttribute('aria-busy', String(flag));
}

async function enviarMensagem() {
  const mensagem = (input.value || '').trim();
  if (!mensagem) return;

  // UI otimista
  input.value = '';
  input.disabled = true;
  botaoEnviar.disabled = true;

  const bolhaUser = criaBolhaUsuario(mensagem);
  chat.appendChild(bolhaUser);

  const bolhaBot = criaBolhaBot();
  chat.appendChild(bolhaBot);
  setTyping(true);
  vaiParaFinalDoChat();

  try {
    const resp = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: getSessionId(), mensagem })
    });

    const data = await resp.json();
    const texto = data.response || data.error || '(sem resposta)';

    // Renderiza markdown do bot com marked
    bolhaBot.innerHTML = renderMarkdownSeguro(texto);
  } catch (err) {
    console.error(err);
    bolhaBot.textContent = 'Erro ao falar com o servidor.';
  } finally {
    setTyping(false);
    vaiParaFinalDoChat();
    input.disabled = false;
    botaoEnviar.disabled = false;
    input.focus();
  }
}

function criaBolhaUsuario(texto) {
  const bolha = document.createElement('p');
  bolha.className = 'chat__bolha chat__bolha--usuario';
  bolha.textContent = texto;
  return bolha;
}

function criaBolhaBot() {
  const bolha = document.createElement('p');
  bolha.className = 'chat__bolha chat__bolha--bot';
  bolha.innerHTML = '<div class="loader"></div>';
  return bolha;
}

function vaiParaFinalDoChat() {
  chat.scrollTop = chat.scrollHeight;
}

function limparConversa() {
  localStorage.removeItem('sid'); // nova sessão
  location.reload();
}

// --- Markdown seguro (remove <script> e event handlers) ---
function renderMarkdownSeguro(md) {
  try {
    const html = marked.parse(md || '');

    // remove scripts e on* handlers (sanitização leve)
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('script').forEach(s => s.remove());
    tmp.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
      });
      // evita alvo malicioso
      if (el.tagName === 'A') el.setAttribute('rel', 'noopener noreferrer');
    });
    return tmp.innerHTML;
  } catch {
    // fallback puro texto
    const div = document.createElement('div');
    div.textContent = md ?? '';
    return div.innerHTML;
  }
}
