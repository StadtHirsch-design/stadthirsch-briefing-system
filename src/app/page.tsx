// APPLE-STYLE REDESIGN v2.2
// Inspiriert von Apple Messages & Notes

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User, Bot, Plus, Menu, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '# Willkommen\n\nIch bin dein KI-Briefing-Assistent. Beschreibe dein Projekt, und wir entwickeln gemeinsam ein professionelles Briefing.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input 
    };
    
    setMessages(m => [...m, userMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      setMessages(m => [...m, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ich habe verstanden: "${userMsg.content}"\n\nLass mich einige gezielte Fragen stellen, um alle Details zu erfassen.`
      }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#F5F5F7] border-r border-gray-300/50 transform transition-transform lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="h-16 flex items-center px-5 border-b border-gray-300/50 bg-[#F5F5F7]/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-[15px]">StadtHirsch</h1>
              <p className="text-xs text-gray-500">Briefing-System</p>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <div className="p-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
            <Plus className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700 text-[15px]">Neues Briefing</span>
          </button>
        </div>

        {/* History */}
        <div className="px-4">
          <h2 className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Verlauf
          </h2>
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4">
            <p className="text-sm text-gray-400 text-center">
              Keine bisherigen Briefings
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-300/50">
          <p className="text-xs text-gray-400 text-center">v2.2 • Apple Design</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Chat */}
      <main className="flex-1 flex flex-col bg-white shadow-2xl">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur border-b border-gray-200/60">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-medium text-gray-800 text-[15px]">Neues Briefing</span>
          </div>
          
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium shadow-sm hover:shadow transition-all">
            Briefing erstellen
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-2xl mx-auto py-8 px-6">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-4 mb-8 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' 
                    ? 'bg-gray-700' 
                    : 'bg-blue-500'
                }`}>
                  {m.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1.5 block">
                    {m.role === 'user' ? 'Du' : 'StadtHirsch KI'}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 mb-8">
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 px-5 py-4 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200/60">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3 bg-gray-100 rounded-3xl px-4 py-2.5 shadow-inner">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Nachricht schreiben..."
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none min-h-[24px] max-h-[120px] py-2 text-[15px] text-gray-900 placeholder:text-gray-400"
              />
              <button
                onClick={send}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-3">
              KI kann Fehler machen • Bitte überprüfen
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
