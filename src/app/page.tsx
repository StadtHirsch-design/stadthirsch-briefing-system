// CACHE BUST: v2026.02.14-0815
// Radikal vereinfachtes Layout für sofortige Sichtbarkeit

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User, Bot, Sparkles } from 'lucide-react';
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
      content: '# Willkommen beim StadtHirsch KI-Briefing\n\nDies ist die **NEUE VERSION v2.1** mit verbessertem Layout.\n\nWie kann ich dir helfen?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      setMessages(m => [...m, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Du sagst: "${userMsg.content}"\n\nIch verstehe. Lass uns dein Projekt besprechen.`
      }]);
      setIsLoading(false);
    }, 1000);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">StadtHirsch</h1>
              <p className="text-sm text-gray-500">v2.1 LIVE</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Neues Briefing starten...</p>
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">System bereit • Cache v2026.02.14</p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
          <span className="font-medium text-gray-700">Neues Briefing</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            Briefing erstellen
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto py-8">
            {messages.map((m, i) => (
              <div key={m.id} className={`flex gap-4 px-6 py-6 ${i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' ? 'bg-gray-800' : 'bg-blue-600'
                }`}>
                  {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 pt-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    {m.role === 'user' ? 'Du' : 'StadtHirsch KI'}
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 px-6 py-6">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 bg-gray-100 rounded-xl p-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Schreibe eine Nachricht..."
                className="flex-1 bg-transparent px-4 py-3 resize-none outline-none min-h-[50px] max-h-[150px] text-gray-900"
                rows={1}
              />
              <button
                onClick={send}
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              KI kann Fehler machen • v2.1 Cache-Bust Build
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
