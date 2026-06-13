import { GoogleGenAI } from "@google/genai";

const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export const generateGeminiText = async (prompt) => {
  if (!ai) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      temperature: 0.7,
    },
  });

  return response.text?.trim() || "";
};