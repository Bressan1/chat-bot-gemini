import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function main() {
  // cria o chat com histórico inicial
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [
      { role: "user",  parts: [{ text: "Hello, I have 2 dogs in my house." }] },
      { role: "model", parts: [{ text: "Great to meet you. What would you like to know?" }] },
    ],
  });

  // turno 1
  const r1 = await chat.sendMessage({
    message: "How many paws are in my house?"
  });
  console.log("Resposta 1:", r1.text);

  // turno 2 (continua no mesmo chat, com o contexto preservado)
  const r2 = await chat.sendMessage({
    message: "And how many ears?"
  });
  console.log("Resposta 2:", r2.text);

  // você pode inspecionar o histórico atualizado, se quiser:
  // console.log(chat.history);
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
