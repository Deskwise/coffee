
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { CONFIG } from '../config';

interface GeminiAPI {
  generateBio: (prompt: string) => Promise<string>;
}

export const geminiService: GeminiAPI = {
  async generateBio(prompt: string): Promise<string> {
    // Check Config first (for hardcoded keys during deploy), then Env (for local dev)
    const apiKey = CONFIG.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('API_KEY is not set in config.ts or environment. Cannot use Gemini API.');
      // Fallback: return a generic bio or throw an error
      return `Experienced the app a lot recently. Enjoy connecting with other men.`;
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short (2-3 sentences) profile bio based on the following keywords/information: "${prompt}". Focus on community, connection, and a positive outlook.`,
        config: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 100, // Keep it short
        },
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating bio with Gemini API:', error);
      // Fallback: return a generic bio or re-throw the error
      return `Loves to connect with new people and build strong community bonds. Eager for great conversations.`;
    }
  },
};
