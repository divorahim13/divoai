import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from '../constants';
import { Message } from '../types';

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChatResponse = async (history: Message[], newMessage: string): Promise<string> => {
  try {
    // Convert history to Gemini format (limiting context window for this demo to save tokens)
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: GEMINI_MODEL,
      history: recentHistory,
      config: {
          temperature: 0.7,
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate response from AI.");
  }
};

// Helper to estimate token count (1 token ~= 4 characters)
export const estimateTokenCount = (text: string): number => {
  return Math.ceil(text.length / 4);
};