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

// Helper to check various env prefixes (Vite uses VITE_, Next uses NEXT_PUBLIC_, CRA uses REACT_APP_)
const getEnv = (key: string) => {
  // Check standard process.env (Node/Webpack)
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  // Check Vite specific (import.meta.env)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
  
  // Check for prefixed versions in process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`NEXT_PUBLIC_${key}`] || 
           process.env[`VITE_${key}`] || 
           process.env[`REACT_APP_${key}`];
  }
  return '';
};

// Supabase Configuration
export const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://placeholder.supabase.co';

// Using the provided "Publishable key" as the Anon Key
// This is safe to be public as it uses RLS for security, but we still put it in env vars for clean code
export const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'placeholder';

// OpenAI API Key
// CRITICAL: In a production app, this should go through a backend proxy.
// For this MVP demo, we load it from env vars.
export const OPENAI_API_KEY = getEnv('OPENAI_API_KEY') || '';