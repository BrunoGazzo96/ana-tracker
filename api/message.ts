import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { total, callCount } = req.body as {
    total: number;
    callCount: number;
  };

  const minutesWorked = Math.round(total / 0.12);

  const prompt = `Eres un asistente motivacional para Ana, una intérprete médica que cobra $0.12 por minuto de interpretación.

Hoy lleva:
- $${total.toFixed(2)} ganados en total
- ${callCount} llamada(s) completada(s)
- Aproximadamente ${minutesWorked} minutos de trabajo

Genera un mensaje de aliento CORTO (máximo 2 oraciones), cálido y personalizado para Ana.
El mensaje debe ser acorde al monto ganado:
- Si ganó menos de $10: anímala con entusiasmo al comienzo del día
- Si ganó entre $10 y $30: celebra su progreso y mantenela motivada
- Si ganó entre $30 y $60: reconoce su gran trabajo y que está llegando a una jornada exitosa
- Si ganó más de $60: felicitala efusivamente por una jornada excepcional

Responde SOLO con el mensaje, sin comillas, sin explicaciones. Directo al corazón.`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return res.status(200).json({ message: text });
}
