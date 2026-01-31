import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';
import { Message } from '../types';

// Validation for missing or placeholder credentials
const isPlaceholderUrl = !SUPABASE_URL || SUPABASE_URL.includes('YOUR_PROJECT_ID') || SUPABASE_URL === 'https://placeholder.supabase.co';

if (isPlaceholderUrl) {
  console.error('CRITICAL: Supabase URL is missing or invalid. Please update constants.ts with your actual Supabase Project URL.');
}

const url = isPlaceholderUrl ? 'https://placeholder.supabase.co' : SUPABASE_URL;
const key = SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(url, key);

// --- LOCAL STORAGE FALLBACK HELPERS ---
// This ensures the app works even if the user hasn't run the SQL script yet.
const LS_PREFIX = 'divo_local_';

const getLocal = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(LS_PREFIX + key);
    return item ? JSON.parse(item) : null;
  } catch (e) { return null; }
};

const setLocal = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(data)); } catch(e) {}
};

const genId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// Check if error is due to missing tables
const isTableMissingError = (error: any) => {
  return error?.code === '42P01' || error?.message?.includes('Could not find the table') || error?.message?.includes('relation "public.profiles" does not exist');
};

const handleTableError = (error: any, context: string) => {
  if (isTableMissingError(error)) {
    console.warn(`[Graceful Fallback] Database Error (${context}): Table not found. Switching to LocalStorage.`);
    return true; 
  }
  return false;
};

// --- PROFILES & USAGE ---

export const getCurrentUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (handleTableError(error, 'UserProfile')) {
        // Fallback: Get usage from local storage
        const localUsage = getLocal(`usage_${userId}`) || 0;
        return { id: userId, email: 'local@user.com', usage_cost: localUsage };
    }
    if (error.code === 'PGRST116') return { id: userId, email: '', usage_cost: 0 };
    throw error;
  }
  return data;
};

export const updateUserUsage = async (userId: string, newCost: number) => {
  // 1. Try fetching current from DB
  const { data: currentProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('usage_cost')
    .eq('id', userId)
    .single();

  // If DB read fails due to missing table, use LocalStorage
  if (fetchError && isTableMissingError(fetchError)) {
    const currentUsage = getLocal(`usage_${userId}`) || 0;
    const updated = currentUsage + newCost;
    setLocal(`usage_${userId}`, updated);
    return updated;
  }

  const updatedCost = (currentProfile?.usage_cost || 0) + newCost;

  // 2. Try updating DB
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ usage_cost: updatedCost })
    .eq('id', userId);

  if (updateError) {
    if (handleTableError(updateError, 'UpdateUsage')) {
      // Fallback: save to local
      setLocal(`usage_${userId}`, updatedCost);
      return updatedCost;
    }
  }
  
  return updatedCost;
};

// --- CHAT HISTORY (CONVERSATIONS) ---

export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (handleTableError(error, 'GetConversations')) {
      // Fallback: Read from LocalStorage
      const localConvos = getLocal(`convos_${userId}`) || [];
      // Ensure sorting by date desc
      return localConvos.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    throw error;
  }
  return data;
};

export const createConversation = async (userId: string, title: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ user_id: userId, title }])
    .select()
    .single();

  if (error) {
    if (handleTableError(error, 'CreateConversation')) {
      // Fallback: Create in LocalStorage
      const newConvo = {
        id: genId(),
        user_id: userId,
        title,
        created_at: new Date().toISOString()
      };
      const list = getLocal(`convos_${userId}`) || [];
      setLocal(`convos_${userId}`, [newConvo, ...list]);
      return newConvo;
    }
    throw error;
  }
  return data;
};

// --- MESSAGES ---

export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    if (handleTableError(error, 'GetMessages')) {
      // Fallback: Read from LocalStorage
      const localMsgs = getLocal(`msgs_${conversationId}`) || [];
      // Map stored 'assistant' -> 'model' if needed, though we store strictly locally here
      return localMsgs.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        content: msg.content
      }));
    }
    throw error;
  }
  
  return data.map((msg: any) => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    content: msg.content
  }));
};

export const saveMessage = async (conversationId: string, role: string, content: string) => {
  const dbRole = role === 'model' ? 'assistant' : role;
  
  const { error } = await supabase
    .from('messages')
    .insert([{ conversation_id: conversationId, role: dbRole, content }]);

  if (error) {
    if (handleTableError(error, 'SaveMessage')) {
      // Fallback: Save to LocalStorage
      const msg = {
        id: genId(),
        conversation_id: conversationId,
        role: dbRole,
        content,
        created_at: new Date().toISOString()
      };
      const list = getLocal(`msgs_${conversationId}`) || [];
      setLocal(`msgs_${conversationId}`, [...list, msg]);
      return;
    }
    // Don't throw for other errors to avoid blocking UI
    console.error("Failed to save message", error);
  }
};