// Usage Limit Configuration
export const USAGE_LIMIT_USD = 0.001; // $0.001 limit per user

// Mock Pricing (SaaS Markup)
export const COST_PER_TOKEN = 0.50 / 1000000; 

// Gemini Configuration (Not used currently, but kept for reference)
export const GEMINI_MODEL = 'gemini-3-flash-preview';

// OpenAI Configuration
export const OPENAI_MODEL = 'gpt-4o-mini';

// --- Environment Variable Handling ---

// In Vite (which serves this app), we use process.env to avoid TypeScript errors with import.meta.env.
// These are replaced at BUILD TIME by Vercel/Vite.

export const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
export const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';
