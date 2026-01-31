import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_MODEL } from '../constants';
import { Message } from '../types';

// Check if key is loaded
if (!OPENAI_API_KEY) {
  console.warn("OpenAI API Key is missing. Please set VITE_OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.");
}

// Initialize OpenAI Client
// dangerouslyAllowBrowser is required because we are calling the API directly from the frontend
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const generateChatResponse = async (history: Message[], newMessage: string): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error("API Key is missing. Please configure your environment variables.");
  }

  try {
    // Format messages for OpenAI
    // FIX: OpenAI expects 'assistant' for AI responses, but our app uses 'model'.
    // We map 'model' -> 'assistant' here.
    const messages = [
      { role: "system", content: "You are a helpful and concise AI assistant." },
      ...history.map(msg => ({ 
        role: msg.role === 'model' ? 'assistant' : msg.role, 
        content: msg.content 
      })),
      { role: "user", content: newMessage }
    ];

    const completion = await openai.chat.completions.create({
      messages: messages as any,
      model: OPENAI_MODEL,
    });

    return completion.choices[0]?.message?.content || "No response generated.";
  } catch (error: any) {
    console.error("OpenAI API Error Details:", error);

    // Provide more specific error messages for the UI
    if (error?.status === 401) {
      throw new Error(`Authentication failed (401). Please check if your API Key is valid and has credits.`);
    }
    if (error?.status === 400) {
      throw new Error(`Bad Request (400): ${error.message}`);
    }
    if (error?.status === 429) {
      throw new Error("Rate limit exceeded (429). You are out of credits or sending too many requests.");
    }
    if (error?.status === 500) {
      throw new Error("OpenAI server error. Please try again later.");
    }
    
    throw new Error(error?.message || "Failed to generate response from AI.");
  }
};

// Helper to estimate token count
export const estimateTokenCount = (text: string): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};