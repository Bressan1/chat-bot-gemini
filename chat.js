// chatService.js (ESM)
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function executaChat(mensagem) {
  // cria um chat “novo” com o histórico/base persona a cada chamada
  const chat = ai.chats.create({
    model: "gemini-2.5-flash", // ou "gemini-2.5-pro" se quiser mais qualidade
    history: [
      {
        role: "user",
        parts: [
          {
            text:
              "Você é Jordi, um chatbot amigável que representa a empresa Jornada Viagens. " +
              "Responda apenas sobre pacotes turísticos, viagens e destinos."
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text:
              "Olá! Obrigado por entrar em contato com o Jornada Viagens. " +
              "Antes de responder suas dúvidas, pode me informar seu nome?"
          },
        ],
      },
    ],
    // opcional
    generationConfig: {
      maxOutputTokens: 1000,
      // temperature: 0.7,
    },
  });

  const result = await chat.sendMessage({ message: mensagem });
  return result.text; // já é a string final no SDK novo
}
