// chatState.js
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// memória por sessão
// sessions: Map<sessionId, { chat, perfil: { nome?, destino?, orcamento?, dias? } }>
const sessions = new Map();

// ---------- helpers de parsing bem simples (PT-BR) ----------
function extrairNome(msg) {
  // "meu nome é Ana", "sou Pedro", "é João"
  const m1 = msg.match(/\bmeu nome é\s+([a-zá-úãõâêôç][\w\sá-úãõâêôç'-]{1,40})/i);
  if (m1) return capitalizar(m1[1].trim());
  const m2 = msg.match(/\bsou\s+([a-zá-úãõâêôç][\w\sá-úãõâêôç'-]{1,40})/i);
  if (m2) return capitalizar(m2[1].trim());
  // se a pessoa mandar só uma palavra com inicial maiúscula, arrisca como nome
  const m3 = msg.trim().match(/^[A-ZÁ-Ú][a-zá-úãõâêôç'-]{1,30}$/);
  if (m3) return capitalizar(m3[0]);
  return null;
}

function extrairDestino(msg) {
  // "quero ir para Paris", "quero viajar pra Nova York", "vou para Lisboa"
  const m = msg.match(/\b(?:quero (?:ir|viajar)\s+(?:para|pra)|vou\s+(?:para|pra))\s+([a-zá-úãõâêôç][\w\sá-úãõâêôç'-]{2,60})/i);
  if (m) return capitalizar(m[1].trim());
  // fallback: "para Paris" isolado
  const m2 = msg.match(/\b(?:para|pra)\s+([A-ZÁ-Ú][\w\sá-úãõâêôç'-]{1,60})/);
  if (m2) return capitalizar(m2[1].trim());
  return null;
}

function extrairOrcamento(msg) {
  // aceita "R$ 5.000", "5000", "R$2000,00"
  const m = msg.replace(/\./g, "").match(/\b(?:R\$ ?)?(\d{3,6})(?:[,\.](\d{2}))?\b/);
  if (!m) return null;
  // retorna em número (inteiro de reais)
  return parseInt(m[1], 10);
}

function extrairDias(msg) {
  const m = msg.match(/(\d{1,3})\s*dias?/i);
  if (m) return parseInt(m[1], 10);
  return null;
}

function capitalizar(str) {
  return str
    .split(" ")
    .map(s => s ? s[0].toUpperCase() + s.slice(1) : s)
    .join(" ");
}

// ---------- criação/recuperação do chat + estado ----------
export function getOrCreateChat(sessionId) {
  if (sessions.has(sessionId)) return sessions.get(sessionId);
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [
      {
        role: "user",
        parts: [{
          text:
            "Você é Jordi, um chatbot amigável do Jornada Viagens. " +
            "Responda apenas sobre turismo e pacotes de viagem. " +
            "Se o usuário disser um destino, colete também orçamento e quantidade de dias."
        }],
      },
      {
        role: "model",
        parts: [{ text: "Olá! Qual o seu nome?" }],
      },
    ],
    generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
  });

  const state = { chat, perfil: { nome: null, destino: null, orcamento: null, dias: null } };
  sessions.set(sessionId, state);
  return state;
}

// ---------- loop principal de mensagem ----------
export async function enviarMensagem(sessionId, mensagem) {
  const state = getOrCreateChat(sessionId);
  const { chat, perfil } = state;
  const msg = (mensagem || "").trim();

  // 1) tenta capturar slots do usuário
  if (!perfil.nome) {
    const nome = extrairNome(msg);
    if (nome) perfil.nome = nome;
  }
  const dest = extrairDestino(msg);
  if (dest) perfil.destino = dest;

  const orc = extrairOrcamento(msg);
  if (orc) perfil.orcamento = orc;

  const d = extrairDias(msg);
  if (d) perfil.dias = d;

  // 2) perguntas guiadas (sem chamar LLM quando dá pra ser objetivo)
  if (!perfil.nome) {
    return "Perfeito! Antes de avançar, qual é o seu nome?";
  }

  if (perfil.destino && !perfil.orcamento) {
    return `Ótimo, ${perfil.nome}! Qual é o seu orçamento aproximado para a viagem a ${perfil.destino}? (pode ser algo como R$ 5.000)`;
  }

  if (perfil.destino && perfil.orcamento && !perfil.dias) {
    return `Perfeito! E por quantos dias você pretende ficar em ${perfil.destino}?`;
  }

  // 3) se ainda não houve destino, empurra gentilmente para esse caminho
  if (!perfil.destino) {
    // ainda manda para o LLM pra uma resposta natural enquanto conduz
    const r = await chat.sendMessage({
      message: `Meu nome é ${perfil.nome}. ${msg}. Estou interessado em viagens.`,
    });
    // complementa com orientação
    return r.text + "\n\nTem algum destino em mente? Se tiver, me diga também seu orçamento e por quantos dias pretende viajar.";
  }

  // 4) quando já temos tudo (nome, destino, orçamento, dias) → pede proposta ao LLM com contexto
  if (perfil.nome && perfil.destino && perfil.orcamento && perfil.dias) {
    const contexto = `
Contexto do cliente:
- Nome: ${perfil.nome}
- Destino: ${perfil.destino}
- Orçamento (aprox.): R$ ${perfil.orcamento.toLocaleString("pt-BR")}
- Dias de viagem: ${perfil.dias}

Monte uma sugestão de pacote com:
- Voo (faixa de preço, companhia sugerida se fizer sentido)
- Hospedagem (2-3 opções por faixa: econômica / confortável / premium)
- Roteiro resumido por dia (bullet points)
- Dicas de temporada/clima para ${perfil.destino}
- Estimativa total dentro do orçamento
- Observações e alternativas caso exceda orçamento
`.trim();

    const r = await chat.sendMessage({
      message: `${msg}\n\n${contexto}`,
    });
    return r.text;
  }

  // 5) fallback: conversa normal com LLM mantendo o histórico
  const r = await chat.sendMessage({ message: msg });
  return r.text;
}
