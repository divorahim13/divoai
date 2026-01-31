import React, { useState, useEffect, useRef } from 'react';
import { 
  supabase, 
  getCurrentUserProfile, 
  updateUserUsage,
  getConversations,
  getMessages,
  createConversation,
  saveMessage
} from '../services/supabase';
// SWITCHED BACK TO OPENAI
import { generateChatResponse, estimateTokenCount } from '../services/openai';
import { Message } from '../types';
import { USAGE_LIMIT_USD, COST_PER_TOKEN } from '../constants';
import { UsageIndicator } from './UsageIndicator';
import { Send, LogOut, Bot, AlertCircle, Loader2, Sparkles, Plus, MessageSquare, X, User, ArrowRight, Zap, Code, Lightbulb } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const STARTER_PROMPTS = [
  { icon: <Code className="w-4 h-4 text-blue-500" />, label: "Write a React Hook", prompt: "Write a custom React hook to handle local storage." },
  { icon: <Zap className="w-4 h-4 text-yellow-500" />, label: "Explain Quantum Physics", prompt: "Explain quantum physics to a 5 year old." },
  { icon: <Lightbulb className="w-4 h-4 text-green-500" />, label: "Business Ideas", prompt: "Give me 5 SaaS ideas for the real estate market." },
];

export const ChatInterface: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageCost, setUsageCost] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialization
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          // Load Profile
          try {
            const profile = await getCurrentUserProfile(session.user.id);
            if (profile) setUsageCost(profile.usage_cost);
          } catch (e) {
            console.warn("Could not load profile, defaulting to 0 usage");
          }
          
          // Load Conversations History
          loadConversations(session.user.id);
        }
      } catch (err) {
        console.error("Init failed", err);
      }
    };
    init();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadConversations = async (uid: string) => {
    try {
      const data = await getConversations(uid);
      setConversations(data || []);
    } catch (err) {
      console.warn("Failed to load history (tables might be missing)", err);
    }
  };

  const handleLoadChat = async (chatId: string) => {
    setLoading(true);
    setActiveChatId(chatId);
    setError(null);
    setIsSidebarOpen(false);
    try {
      const msgs = await getMessages(chatId);
      setMessages(msgs);
    } catch (err) {
      setError("Failed to load chat history.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setError(null);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const processMessage = async (msgText: string) => {
    if (!msgText.trim() || !userId) return;

    if (usageCost >= USAGE_LIMIT_USD) {
      setError("Free limit reached. Please upgrade to continue.");
      return;
    }

    const userMessage = msgText.trim();
    setInput('');
    setError(null);

    // Optimistic UI update
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      let currentChatId = activeChatId;

      // 1. Create Conversation if needed
      if (!currentChatId) {
        try {
          const title = userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
          const newConvo = await createConversation(userId, title);
          if (newConvo) {
            currentChatId = newConvo.id;
            setActiveChatId(newConvo.id);
            await loadConversations(userId);
          }
        } catch (convoError) {
          console.warn("Database conversation creation failed (continuing in-memory):", convoError);
        }
      }

      // 2. Save User Message
      if (currentChatId) {
        saveMessage(currentChatId, 'user', userMessage).catch(err => console.warn("DB Save failed", err));
      }

      // 3. Generate Response
      const aiResponseText = await generateChatResponse(messages, userMessage);
      
      // 4. Calculate Costs
      const inputTokens = estimateTokenCount(userMessage);
      const outputTokens = estimateTokenCount(aiResponseText);
      const totalTokens = inputTokens + outputTokens;
      const requestCost = totalTokens * COST_PER_TOKEN;

      // 5. Update Usage
      try {
          const newTotalCost = await updateUserUsage(userId, requestCost);
          setUsageCost(newTotalCost);
      } catch (dbError) {
          console.warn("Usage update failed, updating local state only");
          setUsageCost(prev => prev + requestCost);
      }

      // 6. Save AI Message
      if (currentChatId) {
        saveMessage(currentChatId, 'assistant', aiResponseText).catch(err => console.warn("DB Save failed", err));
      }
      
      // 7. Update UI
      setMessages(prev => [...prev, { role: 'model', content: aiResponseText }]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process message.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(input);
  };

  const isLimitReached = usageCost >= USAGE_LIMIT_USD;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-message {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-800">Divo AI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={handleNewChat}
            className="w-full group flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-indigo-500/30 hover:-translate-y-0.5 text-sm font-medium"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            New Chat
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 py-2 custom-scrollbar">
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Recent History</p>
          {conversations.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
              <MessageSquare className="w-8 h-8 opacity-20" />
              <span>No history yet</span>
            </div>
          ) : (
            conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleLoadChat(chat.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group ${
                  activeChatId === chat.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className={`h-4 w-4 shrink-0 transition-colors ${activeChatId === chat.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="truncate">{chat.title || 'Untitled Chat'}</span>
                {activeChatId === chat.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
              </button>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-600 hover:text-red-600 transition-colors rounded-xl hover:bg-white hover:shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full bg-white md:bg-slate-50/50">
        
        {/* Background Decoration */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
           <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"></div>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2"></div>
        </div>

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md sticky top-0 z-20 border-b border-white/50">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
            <div>
               <h2 className="font-semibold text-gray-800 tracking-tight">
                 {activeChatId ? (conversations.find(c => c.id === activeChatId)?.title || 'Chat') : 'New Conversation'}
               </h2>
               <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-600 tracking-wider mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Ready
               </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-600">
              <Sparkles className="w-3 h-3" />
              Pro Model
            </span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-6 scroll-smooth custom-scrollbar relative z-10">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Usage Stats Banner */}
            <UsageIndicator currentUsage={usageCost} />

            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[400px] animate-message">
                 <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-white/50">
                        <Bot className="w-12 h-12 text-indigo-600" />
                    </div>
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">Hello! I'm Divo.</h3>
                 <p className="text-gray-500 mb-10 text-center max-w-md leading-relaxed">
                   I'm your AI coding companion. Ask me anything about development, writing, or analysis.
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                    {STARTER_PROMPTS.map((starter, i) => (
                      <button 
                        key={i}
                        onClick={() => processMessage(starter.prompt)}
                        className="flex flex-col gap-2 p-4 bg-white hover:bg-indigo-50/50 border border-gray-100 hover:border-indigo-100 rounded-2xl text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 group"
                      >
                        <div className="p-2 bg-gray-50 rounded-lg w-fit group-hover:bg-white transition-colors">
                          {starter.icon}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{starter.label}</span>
                        <span className="text-xs text-gray-400 line-clamp-2">{starter.prompt}</span>
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {/* Message List */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 animate-message ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role === 'model' && (
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm mt-1">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-6 py-4 shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-indigo-500/20' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-gray-200/50'
                }`}>
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 animate-message">
                 <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 font-medium mr-2">Thinking</span>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50/50 border border-red-100 rounded-xl justify-center animate-message backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-white via-white/80 to-transparent pt-10">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-20 group-focus-within:opacity-40 transition duration-500 blur"></div>
              <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-indigo-500/10 border border-gray-100">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLimitReached ? "Usage limit reached" : "Type your message..."}
                  disabled={loading || isLimitReached}
                  className="w-full pl-6 pr-16 py-4 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed text-[15px]"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    type="submit"
                    disabled={!input.trim() || loading || isLimitReached}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg transform active:scale-95 flex items-center justify-center"
                  >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-3 tracking-wide">
              Divo may produce inaccurate information about people, places, or facts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

function Menu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}