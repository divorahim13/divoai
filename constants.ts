// Usage Limit Configuration
export const USAGE_LIMIT_USD = 0.001; // $0.001 limit per user

// Mock Pricing (SaaS Markup)
// Using gpt-4o-mini pricing approx: $0.15/1M input, $0.60/1M output
// We'll average it to $0.50 per 1M tokens for the demo logic
export const COST_PER_TOKEN = 0.50 / 1000000; 

// Gemini Configuration (Not used currently, but kept for reference)
export const GEMINI_MODEL = 'gemini-3-flash-preview';

// OpenAI Configuration
export const OPENAI_MODEL = 'gpt-4o-mini';

// --- Environment Variable Handling ---

// Helper for process.env (Node, Next.js, Standard Webpack)
const getProcessEnv = (key: string) => {
  if (typeof process === 'undefined' || !process.env) return undefined;
  // Check common prefixes
  return process.env[key] || 
         process.env[`NEXT_PUBLIC_${key}`] || 
         process.env[`VITE_${key}`] || 
         process.env[`REACT_APP_${key}`];
};

// Explicitly read Vite variables so the bundler can statically replace them at build time.
// Dynamic access (e.g. import.meta.env[`VITE_${key}`]) DOES NOT work in Vite production builds.
// @ts-ignore
const VITE_SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_SUPABASE_URL : undefined;
// @ts-ignore
const VITE_SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;
// @ts-ignore
const VITE_OPENAI_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_OPENAI_API_KEY : undefined;

// Supabase Configuration
export const SUPABASE_URL = VITE_SUPABASE_URL || getProcessEnv('SUPABASE_URL') || 'https://placeholder.supabase.co';

// Using the provided "Publishable key" as the Anon Key
export const SUPABASE_ANON_KEY = VITE_SUPABASE_ANON_KEY || getProcessEnv('SUPABASE_ANON_KEY') || 'placeholder';

// OpenAI API Key
export const OPENAI_API_KEY = VITE_OPENAI_API_KEY || getProcessEnv('OPENAI_API_KEY') || '';
