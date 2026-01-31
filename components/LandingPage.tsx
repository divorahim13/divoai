import React, { useState, useEffect } from 'react';
import { ArrowRight, Bot, Zap, Shield, Sparkles, Code, Brain, Globe } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (event: MouseEvent) => {
      // Use client coordinates directly for fixed positioning
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative">
      
      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 5s linear infinite;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        .typing-dot {
          animation: typing 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>

      {/* FIXED Background Layers - Solves Clipping Issues */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* 1. Base Dot Pattern (Replaces Grid) */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>
        
        {/* 2. Interactive Spotlight */}
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08), transparent 50%)`
          }}
        />

        {/* 3. Ambient Blobs (Fixed Position) */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Divo AI</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50/80 backdrop-blur-sm"
        >
          Sign In
        </button>
      </nav>

      {/* Main Content Wrapper */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-16 pb-24 lg:pt-24 overflow-hidden">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm text-indigo-600 text-xs font-semibold uppercase tracking-wide mb-8 hover:scale-105 transition-transform cursor-default ring-1 ring-indigo-50">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Intelligent. Fast. Limitless.</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Your Second Brain,<br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-shimmer">
                Supercharged.
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Unleash your creativity with Divo AI. Generate code, write content, and solve complex problems instantly with our usage-based platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="group relative px-8 py-4 bg-slate-900 text-white font-bold rounded-full text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="flex items-center gap-2">
                  Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            {/* Interactive Chat Preview */}
            <div className="mt-20 relative max-w-4xl mx-auto animate-float">
              {/* Glow Effect behind chat */}
              <div className="absolute inset-0 bg-indigo-500/20 rounded-[2rem] transform rotate-1 scale-105 blur-2xl opacity-40" />
              
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
                {/* Fake Window Controls */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <div className="ml-4 text-xs text-gray-400 font-medium">divo-ai-chat.exe</div>
                </div>

                {/* Chat Content */}
                <div className="p-6 md:p-8 text-left space-y-6">
                  
                  {/* User Message */}
                  <div className="flex items-start gap-4 justify-end">
                     <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl rounded-tr-none px-6 py-3 text-white shadow-md">
                      <p className="font-medium">Write a python script to analyze stock data.</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 border-2 border-white shadow-sm font-bold">
                      U
                    </div>
                  </div>

                  {/* AI Message */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shrink-0 border-2 border-white shadow-sm">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-md rounded-2xl rounded-tl-none px-6 py-4 text-gray-800 w-full max-w-2xl">
                      <p className="mb-3 font-medium text-gray-900">Here is a Python script using pandas and yfinance:</p>
                      
                      <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs md:text-sm text-blue-300 overflow-hidden relative">
                        <div className="flex gap-2 mb-2 text-slate-500">
                           <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                           <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                        </div>
                        <p><span className="text-pink-400">import</span> yfinance <span className="text-pink-400">as</span> yf</p>
                        <p><span className="text-pink-400">import</span> pandas <span className="text-pink-400">as</span> pd</p>
                        <p className="mt-2 text-slate-400"># Download historical data</p>
                        <p>data = yf.download(<span className="text-green-400">"AAPL"</span>, start=<span className="text-green-400">"2023-01-01"</span>)</p>
                        <p className="mt-2"><span className="text-pink-400">def</span> <span className="text-yellow-300">analyze_trend</span>(df):</p>
                        <p className="pl-4">ma50 = df[<span className="text-green-400">'Close'</span>].rolling(window=<span className="text-orange-400">50</span>).mean()</p>
                        
                        {/* Typing Cursor Effect */}
                        <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse align-middle"></span>
                      </div>

                      <div className="mt-3 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full typing-dot"></div>
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full typing-dot"></div>
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full typing-dot"></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white/50 backdrop-blur-sm py-24 border-t border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">Why choose Divo?</h2>
              <p className="text-gray-500 mt-2">Built for performance, privacy, and scale.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-white" />,
                  color: "bg-yellow-500",
                  title: "Lightning Fast",
                  desc: "Powered by Gemini 1.5 Flash for near-instant responses."
                },
                {
                  icon: <Shield className="w-6 h-6 text-white" />,
                  color: "bg-emerald-500",
                  title: "Secure by Default",
                  desc: "Your data is encrypted. We prioritize your privacy above all."
                },
                {
                  icon: <Code className="w-6 h-6 text-white" />,
                  color: "bg-blue-500",
                  title: "Code Expert",
                  desc: "Fine-tuned for programming tasks, debugging, and refactoring."
                }
              ].map((feature, i) => (
                <div key={i} className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
                  <div className={`${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur border-t border-gray-200 py-12 text-center">
          <div className="flex justify-center gap-6 mb-8 text-gray-400">
              <Globe className="w-5 h-5 hover:text-gray-600 cursor-pointer transition-colors" />
              <Brain className="w-5 h-5 hover:text-gray-600 cursor-pointer transition-colors" />
              <Code className="w-5 h-5 hover:text-gray-600 cursor-pointer transition-colors" />
          </div>
          <p className="text-slate-400 text-sm">© 2024 Divo AI. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};