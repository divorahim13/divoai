// Usage Limit Configuration
export const USAGE_LIMIT_USD = 0.001; // $0.001 limit per user

// Mock Pricing (SaaS Markup)
export const COST_PER_TOKEN = 0.50 / 1000000; 

// Gemini Configuration (Not used currently, but kept for reference)
export const GEMINI_MODEL = 'gemini-3-flash-preview';

// OpenAI Configuration
export const OPENAI_MODEL = 'gpt-4o-mini';

// --- Environment Variable Handling ---

// CRITICAL: In Vite applications, we must use import.meta.env.
// process.env is NOT available in the browser by default.
// We use @ts-ignore to prevent TypeScript errors if types aren't generated.

// @ts-ignore
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

// Access properties explicitly to allow Vite to statically replace them at build time
export const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';
export const OPENAI_API_KEY = env.VITE_OPENAI_API_KEY || '';
