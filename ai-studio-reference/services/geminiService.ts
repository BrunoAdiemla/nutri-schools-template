
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeMenuNutritionalValue = async (menu: MenuItem) => {
  const prompt = `Analise o seguinte item de cardápio escolar:
  Nome: ${menu.name}
  Calorias: ${menu.calories}kcal
  Proteína: ${menu.protein}g
  Data prevista: ${menu.date}
  
  Forneça uma análise técnica baseada em padrões nutricionais B2B corporativos (PNAE).
  Responda estritamente em JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "Breve análise técnica" },
            suggestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista de sugestões de melhoria" 
            },
            complianceScore: { type: Type.NUMBER, description: "Nota de 0 a 100 de conformidade" }
          },
          required: ["analysis", "suggestions", "complianceScore"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating AI insight:", error);
    return null;
  }
};
