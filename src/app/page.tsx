// StadtHirsch UI v4.0 – Modern Redesign
// Dark Mode Excellence | Linear / Notion / Vercel Inspired

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, Plus, Menu, Sparkles, MessageSquare, 
  FileText, Search, Settings, ChevronRight, MoreHorizontal,
  Mic, Image as ImageIcon, Paperclip, X, Command
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
  type: 'logo' | 'ci' | 'social' | 'web' | 'other';
  updatedAt: Date;
  unread?: number;
}

// Modern Color Palette (Direct values - no CSS vars)
const COLORS = {
  bg: {
    base: '#000000',
    elevated: '#0A0A0A',
    surface: '#141414',
    hover: '#1A1A1A',
    active: '#222222'
  },
  border: {
    subtle: 'rgba(255,255,255,0.06)',
    default: 'rgba(255,255,255,0.1)',
    strong: 'rgba(255,255,255,0.15)'
  },
  text: {
    primary: 'rgba(255,255,255,0.95)',
    secondary: 'rgba(255,255,255,0.6)',
    tertiary: 'rgba(255,255,255,0.4)',
    disabled: 'rgba(255,255,255,0.25)'
  },
  accent: {
    500: '#8B5CF6',
    600: '#7C3AED',
    gradient: 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
  }
};

// Mock Projects
const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'TechStart Rebranding', type: 'logo', updatedAt: new Date(), unread: 2 },
  { id: '2', title: 'Beratung GmbH CI', type: 'ci', updatedAt: new Date(Date.now() - 86400000) },
  { id: '3', title: 'Social Q1 2026', type: 'social', updatedAt: new Date(Date.now() - 172800000) },
];

// Welcome Message
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `**Willkommen bei StadtHirsch**

Ich bin dein KI-Stratege für kommunikative Spitzenergebnisse. Gemeinsam entwickeln wir ein fundiertes Briefing – präzise, effizient und auf höchstem Niveau.

**Womit soll ich dir heute helfen?**`,
  timestamp: new Date()
};

// Modern Message Bubble
function MessageBubble({ message, isLatest }: { message: Message; isLatest: boolean }) {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className="group flex gap-4 animate-fadeIn"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      {/* Avatar */}
      <div 
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: isUser ? COLORS.accent.gradient : '#3B82F6',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.3)'
        }}
      >
        <span className="text-white text-xs font-semibold">
          {isUser ? 'DU' : 'KI'}
        </span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div 
          className="inline-block max-w-full px-5 py-4 rounded-2xl"
          style={{
            background: isUser ? COLORS.accent.gradient : COLORS.bg.surface,
            border: `1px solid ${isUser ? 'transparent' : COLORS.border.default}`,
            borderBottomLeftRadius: isUser ? '16px' : '4px',
            borderBottomRightRadius: isUser ? '4px' : '16px'
          }}
        >
          <div 
            className="prose prose-sm max-w-none"
            style={{ color: isUser ? 'white' : COLORS.text.primary }}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ marginBottom: '0.75rem' }}>{children}</p>,
                strong: ({ children }) => <strong style={{ fontWeight: 600, color: isUser ? 'white' : 'inherit' }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>{children}</ul>,
                li: ({ children }) => <li style={{ marginBottom: '0.25rem' }}>{children}</li>,
                h1: ({ children }) => <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{children}</h1>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <div 
          className="mt-1 text-xs"
          style={{ color: COLORS.text.tertiary }}
        >
          {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// Typing Indicator
function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: '#3B82F6' }}
      >
        <span className="text-white text-xs font-semibold">KI</span>
      </div>
      <div 
        className="px-5 py-4 rounded-2xl"
        style={{ 
          background: COLORS.bg.surface, 
          border: `1px solid ${COLORS.border.default}`,
          borderBottomLeftRadius: '4px'
        }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span 
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ 
                background: COLORS.text.secondary,
                animation: `bounce 1.4s infinite ease-in-out both`,
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
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
  const [activeProject, setActiveProject] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
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
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ich verstehe. Lass uns "${input.slice(0, 30)}${input.length > 30 ? '...' : ''}" vertiefen.\n\nWelche spezifischen Aspekte sind dir besonders wichtig?`,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ background: COLORS.bg.base }}
    >
      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
            50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${COLORS.text.disabled};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${COLORS.text.tertiary};
        }
      `}</style>

      {/* Sidebar */}
      <aside 
        className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r transition-transform duration-300 ease-out lg:relative lg:translate-x-0"
        style={{ 
          background: COLORS.bg.elevated,
          borderColor: COLORS.border.subtle,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        {/* Logo */}
        <div 
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{ borderColor: COLORS.border.subtle }}
        >
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ 
              background: COLORS.accent.gradient,
              boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)'
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm" style={{ color: COLORS.text.primary }}>StadtHirsch</h1>
            <p className="text-[11px]" style={{ color: COLORS.text.tertiary }}>KI-Briefing v4.0</p>
          </div>
        </div>

        {/* New Briefing Button */}
        <div className="p-4">
          <button 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ 
              background: COLORS.accent.gradient,
              color: 'white',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
            }}
          >
            <Plus className="w-4 h-4" />
            Neues Briefing
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all"
            style={{ 
              background: COLORS.bg.base,
              borderColor: COLORS.border.subtle
            }}
          >
            <Search className="w-4 h-4" style={{ color: COLORS.text.tertiary }} />
            <input 
              type="text"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: COLORS.text.secondary }}
            />
            <kbd 
              className="px-1.5 py-0.5 text-[10px] rounded border"
              style={{ 
                background: COLORS.bg.hover,
                borderColor: COLORS.border.subtle,
                color: COLORS.text.tertiary
              }}
            >
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Projects */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3">
          <div 
            className="text-[11px] font-semibold uppercase tracking-wider px-3 py-2"
            style={{ color: COLORS.text.tertiary }}
          >
            Aktive Briefings
          </div>
          <div className="space-y-1">
            {MOCK_PROJECTS.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150"
                style={{
                  background: activeProject === project.id ? COLORS.bg.hover : 'transparent',
                  border: activeProject === project.id ? `1px solid ${COLORS.border.default}` : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeProject !== project.id) {
                    e.currentTarget.style.background = COLORS.bg.base;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeProject !== project.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ 
                      background: project.type === 'logo' ? '#8B5CF6' : 
                                project.type === 'ci' ? '#3B82F6' : 
                                project.type === 'social' ? '#10B981' : '#6B7280'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-sm font-medium truncate"
                        style={{ color: COLORS.text.primary }}
                      >
                        {project.title}
                      </span>
                      {project.unread && (
                        <span 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold"
                          style={{ background: COLORS.accent[500], color: 'white' }}
                        >
                          {project.unread}
                        </span>
                      )}
                    </div>
                    <p 
                      className="text-xs truncate mt-0.5"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      {project.updatedAt.toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div 
          className="p-3 border-t"
          style={{ borderColor: COLORS.border.subtle }}
        >
          <button 
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            style={{
              background: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = COLORS.bg.base}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
              style={{ background: COLORS.bg.active, color: COLORS.text.secondary }}
            >
              LH
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>Lukas Hirsch</p>
              <p className="text-[11px]" style={{ color: COLORS.text.tertiary }}>CEO</p>
            </div>
            <Settings className="w-4 h-4" style={{ color: COLORS.text.tertiary }} />
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header 
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{ 
            background: 'rgba(10,10,10,0.8)',
            borderColor: COLORS.border.subtle,
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg transition-colors"
              style={{ color: COLORS.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.background = COLORS.bg.surface}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span style={{ color: COLORS.text.tertiary }}>/</span>
              <span className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
                {MOCK_PROJECTS.find(p => p.id === activeProject)?.title || 'Neues Briefing'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ 
                background: COLORS.bg.surface,
                border: `1px solid ${COLORS.border.default}`,
                color: COLORS.text.secondary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.bg.hover;
                e.currentTarget.style.borderColor = COLORS.border.strong;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.bg.surface;
                e.currentTarget.style.borderColor = COLORS.border.default;
              }}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </header>

        {/* Chat */}
        <div 
          className="flex-1 overflow-y-auto custom-scrollbar p-5"
          style={{ background: COLORS.bg.base }}
        >
          <div className="max-w-3xl mx-auto space-y-6">
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
        <div 
          className="p-5 border-t"
          style={{ 
            background: COLORS.bg.elevated,
            borderColor: COLORS.border.subtle
          }}
        >
          <div className="max-w-3xl mx-auto">
            <div 
              className="relative flex items-end gap-3 rounded-2xl border p-3 transition-all"
              style={{ 
                background: COLORS.bg.surface,
                borderColor: COLORS.border.default
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = COLORS.accent[500]}
              onBlur={(e) => e.currentTarget.style.borderColor = COLORS.border.default}
            >
              <button 
                className="p-2 rounded-lg transition-colors flex-shrink-0"
                style={{ color: COLORS.text.tertiary }}
                onMouseEnter={(e) => e.currentTarget.style.background = COLORS.bg.hover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Beschreibe dein Projekt..."
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none min-h-[44px] max-h-[140px] py-2.5 text-sm"
                style={{ color: COLORS.text.primary }}
              />
              
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: COLORS.text.tertiary }}
                  onMouseEnter={(e) => e.currentTarget.style.background = COLORS.bg.hover}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ 
                    background: COLORS.accent.gradient,
                    color: 'white',
                    boxShadow: input.trim() ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (input.trim()) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 24px rgba(139, 92, 246, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = input.trim() ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none';
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <p 
              className="text-center text-xs mt-3"
              style={{ color: COLORS.text.tertiary }}
            >
              Drücke Enter zum Senden • Shift+Enter für neue Zeile
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
