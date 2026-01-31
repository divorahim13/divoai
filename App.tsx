import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import { Auth } from './components/Auth';
import { ChatInterface } from './components/ChatInterface';
import { LandingPage } from './components/LandingPage';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'auth'>('landing');

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to check session:", err);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Route Logic
  if (session) {
    return <ChatInterface />;
  }

  if (view === 'auth') {
    // Add a simple way to go back to landing if needed (optional, but good UX)
    return (
      <div className="relative">
        <button 
          onClick={() => setView('landing')}
          className="absolute top-4 left-4 z-50 px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back
        </button>
        <Auth />
      </div>
    );
  }

  return <LandingPage onGetStarted={() => setView('auth')} />;
};

export default App;