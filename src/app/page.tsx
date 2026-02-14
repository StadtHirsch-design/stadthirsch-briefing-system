'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, Mic, User, Bot, Plus, Menu, 
  Sparkles, FileText, CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Project {
  id: string;
  customer_name: string;
  project_type: string | null;
  status: string;
  created_at: string;
}

const CASE_CONFIGS: Record<string, { icon: string; label: string }> = {
  logo: { icon: '◆', label: 'Logo' },
  ci: { icon: '◎', label: 'Corporate Identity' },
  bildwelt: { icon: '◉', label: 'Bildwelt' },
  piktogramme: { icon: '▣', label: 'Piktogramme' },
  social: { icon: '◈', label: 'Social Media' },
};

export default function ChatInterface() {
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `**Willkommen beim StadtHirsch KI-Briefing**

Ich helfe dir, ein professionelles Briefing für dein Projekt zu entwickeln.

**Worum geht es bei deinem Vorhaben?**`,
      timestamp: new Date()
    }]);
    loadProjects();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/project?limit=10');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Simulate AI response for demo
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Danke für die Information! Das hilft mir sehr.

**Verstanden:** Du planst ein ${userMessage.includes('Logo') ? 'Logo-Projekt' : 'neues Projekt'}.

Lass mich einige gezielte Fragen stellen, um alle relevanten Details zu erfassen:

1. **Zeitrahmen:** Wann soll das Projekt abgeschlossen sein?
2. **Zielgruppe:** Wer ist die primäre Zielgruppe?
3. **Wettbewerb:** Gibt es Referenzen oder Marken, die dir gefallen?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
            <h1 className="font-bold text-gray-900">StadtHirsch</h1>
            <p className="text-sm text-gray-500">KI-Briefing System</p>
          </div>
        </div>

        {/* New Project Button */}
        <div className="p-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Plus className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Neues Briefing</span>
          </button>
        </div>

        {/* Project List */}
        <div className="px-4">
          <h2 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Letzte Briefings
          </h2>
          <div className="space-y-1">
            {projects.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Noch keine Projekte
              </div>
            ) : (
              projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProject(p)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    project?.id === p.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-lg">
                    {CASE_CONFIGS[p.project_type || '']?.icon || '◆'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{p.customer_name}</div>
                    <div className="text-sm text-gray-500">{CASE_CONFIGS[p.project_type || '']?.label || 'Allgemein'}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            {caseConfig ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <span>{caseConfig.icon}</span>
                <span>{caseConfig.label}</span>
              </div>
            ) : (
              <span className="text-gray-500">Neues Briefing</span>
            )}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
            <FileText className="w-4 h-4" />
            <span>Briefing erstellen</span>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`flex gap-4 px-6 py-6 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-gray-800' : 'bg-blue-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 mb-1">
                    {message.role === 'user' ? 'Du' : 'StadtHirsch KI'}
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 px-6 py-6 bg-white">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 pt-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-gray-100 rounded-2xl p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Schreibe eine Nachricht..."
                rows={1}
                className="flex-1 bg-transparent px-4 py-3 resize-none outline-none min-h-[48px] max-h-[120px] text-gray-900 placeholder:text-gray-500"
              />
              
              <div className="flex items-center gap-1 pb-1 pr-1">
                <button className="p-3 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <p className="text-center text-xs text-gray-500 mt-3">
              KI kann Fehler machen. Wichtige Informationen bitte überprüfen.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
