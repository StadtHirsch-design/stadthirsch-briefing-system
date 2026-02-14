'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, Plus, Menu, Sparkles, MessageSquare, 
  FileText, Settings, ChevronRight, User, Bot, 
  Search, MoreHorizontal, X
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
  title: string;
  type: string;
  status: 'active' | 'completed' | 'draft';
  lastMessage: string;
  timestamp: Date;
  unread?: number;
}

// Mock Data
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'TechStart Logo Redesign',
    type: 'logo',
    status: 'active',
    lastMessage: 'Die Farbpalette sollte moderner wirken...',
    timestamp: new Date(),
    unread: 2
  },
  {
    id: '2',
    title: 'Corporate Identity Beratung GmbH',
    type: 'ci',
    status: 'active',
    lastMessage: 'Wir benötigen ein konsistentes Erscheinungsbild...',
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    title: 'Social Media Kampagne Q1',
    type: 'social',
    status: 'completed',
    lastMessage: 'Briefing wurde erstellt und genehmigt.',
    timestamp: new Date(Date.now() - 172800000),
  }
];

// Welcome Message
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `**Willkommen beim StadtHirsch KI-Briefing System**

Ich bin dein strategischer Partner für kommunikative Spitzenergebnisse. Gemeinsam entwickeln wir ein fundiertes Briefing für dein Projekt – präzise, effizient und auf höchstem Niveau.

**Womit kann ich dir heute helfen?**`,
  timestamp: new Date()
};

// Animated Message Bubble
function MessageBubble({ message, isLatest }: { message: Message; isLatest: boolean }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-4 animate-fade-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-brand-600' 
          : 'bg-gradient-to-br from-brand-500 to-brand-700'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      
      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          px-5 py-4 rounded-2xl text-sm leading-relaxed
          ${isUser 
            ? 'bg-brand-600 text-white rounded-br-md' 
            : 'bg-dark-800/80 border border-dark-700/50 text-dark-100 rounded-bl-md backdrop-blur-sm'
          }
        `}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className={`font-semibold ${isUser ? 'text-white' : 'text-white'}`}>{children}</strong>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1.5">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              h1: ({ children }) => <h1 className="text-lg font-bold mb-3 text-white">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-white">{children}</h2>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <span className="text-[11px] text-dark-500 mt-1.5 block">
          {message.role === 'user' ? 'Du' : 'StadtHirsch KI'} • {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

// Typing Indicator
function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="bg-dark-800/50 border border-dark-700/30 px-5 py-4 rounded-2xl rounded-bl-md backdrop-blur-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Ich verstehe. Lass uns das Thema "${input.slice(0, 30)}..." vertiefen.`,
        `Das ist ein spannender Ansatz. Welche Zielgruppe adressierst du primär?`,
        `Danke für diese Information. Sollen wir uns auf die visuelle Umsetzung oder die Strategie konzentrieren?`
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-dark-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-dark-900 border-r border-dark-800 transform transition-transform duration-300 ease-premium lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-dark-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-dark-50 text-sm">StadtHirsch</h1>
            <p className="text-[11px] text-dark-500">KI-Briefing System</p>
          </div>
        </div>

        {/* New Briefing */}
        <div className="p-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium text-sm shadow-glow-sm hover:shadow-glow transition-all duration-200 active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            <span>Neues Briefing</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input 
              type="text"
              placeholder="Suchen..."
              className="w-full bg-dark-800/50 border border-dark-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-dark-200 placeholder:text-dark-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="text-[11px] font-semibold text-dark-500 uppercase tracking-wider px-3 py-2">
            Aktive Briefings
          </div>
          <div className="space-y-1">
            {MOCK_PROJECTS.map((project, i) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  activeProject === project.id 
                    ? 'bg-brand-500/10 border border-brand-500/20' 
                    : 'hover:bg-dark-800/50 border border-transparent'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-dark-200 text-sm truncate">{project.title}</span>
                    {project.unread && (
                      <span className="w-5 h-5 bg-brand-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                        {project.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-dark-500 truncate mt-0.5">{project.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-dark-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-800/50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center">
              <span className="text-sm font-semibold text-dark-300">LH</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-200">Lukas Hirsch</p>
              <p className="text-[11px] text-dark-500">CEO • StadtHirsch</p>
            </div>
            <Settings className="w-4 h-4 text-dark-500" />
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-5 border-b border-dark-800 bg-dark-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 -ml-2 hover:bg-dark-800/50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-dark-400" />
            </button>
            
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-dark-500" />
              <span className="text-sm font-medium text-dark-200">Neues Briefing</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-200 rounded-lg text-sm font-medium transition-all active:scale-[0.98]">
              <FileText className="w-4 h-4" />
              <span>Exportieren</span>
            </button>
          </div>
        </header>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto bg-dark-950">
          <div className="max-w-3xl mx-auto py-8 px-6 space-y-8">
            {messages.map((message, index) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isLatest={index === messages.length - 1}
              />
            ))}
            
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-5 bg-dark-950 border-t border-dark-800">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-3 bg-dark-800/50 border border-dark-700/50 rounded-2xl p-2 focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Beschreibe dein Projekt..."
                rows={1}
                className="flex-1 bg-transparent px-4 py-3 resize-none outline-none min-h-[44px] max-h-[160px] text-sm text-dark-100 placeholder:text-dark-600"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-200 active:scale-[0.96]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-center text-[11px] text-dark-600 mt-3">
              KI kann Fehler machen. Wichtige Informationen bitte überprüfen. • v3.0 Premium
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
