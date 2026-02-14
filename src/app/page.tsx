// CACHE BUST: v2026.02.14-0835
// Apple-Style Premium UI - Version 2.1 FINAL

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User, Bot, Plus, Menu, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Project {
  id: string;
  customer_name: string;
  project_type: string | null;
  status: string;
}

const CASE_CONFIGS: Record<string, { icon: string; label: string }> = {
  logo: { icon: '◆', label: 'Logo' },
  ci: { icon: '◎', label: 'CI' },
  bildwelt: { icon: '◉', label: 'Bildwelt' },
  piktogramme: { icon: '▣', label: 'Piktogramme' },
  social: { icon: '◈', label: 'Social' },
};

export default function ChatInterface() {
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `**Willkommen beim StadtHirsch KI-Briefing**

Ich helfe dir, ein professionelles Briefing für dein Projekt zu entwickeln. Durch gezielte Fragen arbeite ich alle relevanten Aspekte heraus.

**Worum geht es bei deinem Vorhaben?**`,
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects] = useState<Project[]>([]);
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
        content: `Danke für deine Nachricht: "${userMsg.content}"\n\nIch verstehe. Lass uns dein Projekt besprechen.`
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

  const caseConfig = project?.project_type ? CASE_CONFIGS[project.project_type] : null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">StadtHirsch</h1>
            <p className="text-sm text-gray-500">v2.1 LIVE</p>
          </div>
        </div>

        {/* New Project */}
        <div className="p-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200">
            <Plus className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-700">Neues Briefing</span>
          </button>
        </div>

        {/* Project List */}
        <div className="px-4 flex-1 overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-3">
            Letzte Briefings
          </h2>
          {projects.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">
              Keine Projekte vorhanden
            </p>
          ) : (
            projects.map(p => (
              <button
                key={p.id}
                onClick={() => setProject(p)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors mb-1 ${
                  project?.id === p.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                  {CASE_CONFIGS[p.project_type || '']?.icon || '◆'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{p.customer_name}</div>
                  <div className="text-sm text-gray-500">{CASE_CONFIGS[p.project_type || '']?.label || 'Allgemein'}</div>
                </div>
                {p.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">System bereit • v2.1 Deployed</p>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            {caseConfig ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <span>{caseConfig.icon}</span>
                <span>{caseConfig.label}</span>
              </div>
            ) : (
              <span className="text-gray-500 font-medium">Neues Briefing</span>
            )}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" />
            <span>Briefing erstellen</span>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto">
            {messages.map((m, i) => (
              <div key={m.id} className={`flex gap-4 px-6 py-6 ${i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' ? 'bg-gray-800' : 'bg-blue-600'
                }`}>
                  {m.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    {m.role === 'user' ? 'Du' : 'StadtHirsch KI'}
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 px-6 py-6">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1.5 pt-4">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
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
            <div className="flex gap-3 bg-gray-100 rounded-2xl p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Schreibe eine Nachricht..."
                rows={1}
                className="flex-1 bg-transparent px-4 py-3 resize-none outline-none min-h-[50px] max-h-[150px] text-gray-900 placeholder:text-gray-500"
              />
              <button
                onClick={send}
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              KI kann Fehler machen • v2.1 Final Build
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
