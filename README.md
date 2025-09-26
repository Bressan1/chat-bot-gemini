# 🌍 Jordi – Chatbot de Viagens com Gemini

![Jornada Viagens](./static/img/logo.png)

## ✨ Sobre o Projeto

O **Jordi** é um chatbot inteligente para uma agência fictícia de viagens, desenvolvido em **Node.js + Express**, integrado à API **Gemini (Google AI)**. Ele conduz conversas naturais para montar pacotes de viagem personalizados com base em:

* Nome do cliente
* Destino desejado
* Orçamento aproximado
* Quantidade de dias

Com uma **interface moderna** inspirada em apps de IA, o Jordi coleta as informações necessárias, guia o usuário com perguntas inteligentes e retorna uma sugestão de pacote detalhado com voo, hospedagem, roteiro e dicas.

---

## 🚀 Funcionalidades

* 🤖 **Chat multi-turnos** com memória por sessão (cada usuário tem seu histórico)
* 🧑‍💼 **Slot filling**: extrai automaticamente nome, destino, orçamento e dias do texto do usuário
* 🧭 **Orientação guiada**: se faltar informação, o bot pergunta antes de prosseguir
* 📦 **Proposta completa**: monta pacotes dentro do orçamento informado
* 🎨 **Frontend customizado**:

  * Bolhas estilizadas para usuário e bot
  * Sugestões rápidas (chips clicáveis)
  * Indicador de digitação “Jordi está digitando…”
  * Suporte a Markdown nas respostas
* 🔄 **Gerenciamento de sessão** com `sessionId`

---

## ⚙️ Como Rodar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/chat-bot-gemini.git
cd chat-bot-gemini
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o `.env`

Crie um arquivo `.env` na raiz com:

```env
GOOGLE_API_KEY=your_api_key_here
PORT=3000
```

### 4. Rode o servidor

```bash
npm run start
# ou em desenvolvimento
npm run dev
```

### 5. Acesse no navegador

```
http://localhost:3000
```

---

## 💻 Exemplo de Uso

**Fluxo da conversa:**

1. Jordi: *“Olá! Qual o seu nome?”*
2. Usuário: *“Sou Ana”*
3. Jordi: *“Ótimo, Ana! Para onde deseja viajar?”*
4. Usuário: *“Quero ir para Paris”*
5. Jordi: *“Qual seu orçamento aproximado?”*
6. Usuário: *“R$ 6.000”*
7. Jordi: *“Perfeito! Quantos dias pretende ficar em Paris?”*
8. Usuário: *“7 dias”*
9. Jordi: → Retorna proposta completa com voo, hospedagem, roteiro diário e dicas.

---

## 🎨 UI (Frontend)

* Chips de sugestão para preencher rapidamente dados como nome, destino, orçamento.
* Tema visual com **cores oceano/turquesa + pôr-do-sol**, inspirado em viagens.
* Loader animado para indicar resposta do bot.
* Scroll automático sempre para o final da conversa.



---

## 🛠️ Tecnologias Utilizadas

* **Node.js + Express** → backend e rotas
* **Google Gemini API** → inteligência conversacional
* **JavaScript (ESM)** → lógica front e back
* **HTML + CSS** → interface minimalista
* **dotenv** → variáveis de ambiente
* **nodemon** → hot reload em dev

---

## 📈 Próximos Passos (Roadmap)

* [ ] Implementar **reset de sessão** via endpoint `/chat/reset`
* [ ] Adicionar **streaming** de respostas (texto aparecendo aos poucos)
* [ ] Deploy em **Vercel/Render** para demo pública
* [ ] Criar **histórico de conversas** com salvamento no navegador (localStorage) ou backend
* [ ] Adicionar **botões de sugestões inteligentes** no front (ex.: “Quero ir para Roma”, “Orçamento R$ 4000”)
* [ ] (Opcional) Integração com RAG/embeddings para enriquecer respostas com base em documentos reais

---

## 📜 Licença

Projeto criado para fins educacionais e de portfólio. Você pode usar e adaptar livremente.

---

👨‍💻 **Autor**: [Eduardo bressan ](https://github.com/Bressan1)

