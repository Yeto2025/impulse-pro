import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  imageUrl?: string;
}

export async function scanReceipt(base64Image: string): Promise<Partial<Transaction>> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          },
          {
            text: "Extrae los detalles de la transacción de este recibo o captura de pantalla de pago. Devuelve un objeto JSON con: amount (número), type ('income' o 'expense'), category (string en español), y description (string en español). Si es un pago/gasto, el tipo es 'expense'. Si es un depósito/pago recibido, el tipo es 'income'."
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          type: { type: Type.STRING, enum: ['income', 'expense'] },
          category: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["amount", "type", "category", "description"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {};
  }
}
