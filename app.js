import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// 👇 importe também enviarMensagem
import { getOrCreateChat, enviarMensagem } from './chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/static', express.static(join(__dirname, 'static'), { extensions: ['css', 'svg', 'js'] }));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'templates', 'chat.html'));
});

app.post('/chat', async (req, res) => {
  try {
    // ✅ espere { sessionId, mensagem } no body
    const { sessionId = 'default', mensagem } = req.body || {};
    console.log('Mensagem do usuário:', mensagem, ' | sessionId:', sessionId);

    if (!mensagem) {
      return res.status(400).json({ error: 'Faltou o campo "mensagem"' });
    }

    // ✅ envia a mensagem no chat dessa sessão (cria se não existir)
    const resposta = await enviarMensagem(sessionId, mensagem);

    res.json({ response: resposta });
  } catch (error) {
    console.error('Erro no endpoint /chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
