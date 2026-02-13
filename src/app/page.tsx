'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, Loader2, Download, Mic, User, Bot, Plus, Menu, X, 
  MessageSquare, Sparkles, FileText, ChevronRight, CheckCircle2,
  Circle, RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface Project {
  id: string;
  customer_name: string;
  project_type: string | null;
  status: 'briefing' | 'research' | 'strategy' | 'document' | 'completed';
  created_at: string;
  progress?: number;
}

const CASE_CONFIGS: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  logo: { 
    icon: '🎨', 
    label: 'Logo-Entwicklung', 
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20'
  },
  ci: { 
    icon: '🏢', 
    label: 'Corporate Identity', 
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  bildwelt: { 
    icon: '📸', 
    label: 'Bildwelt', 
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/20'
  },
  piktogramme: { 
    icon: '🎯', 
    label: 'Piktogramme', 
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20'
  },
  social: { 
    icon: '📱', 
    label: 'Social Media', 
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/20'
  },
};

const STAGES = [
  { key: 'briefing', label: 'Briefing', icon: MessageSquare },
  { key: 'research', label: 'Recherche', icon: Sparkles },
  { key: 'strategy', label: 'Strategie', icon: CheckCircle2 },
  { key: 'document', label: 'Dokument', icon: FileText },
];

// Streaming hook for word-by-word animation
function useStreamingText(fullText: string, isActive: boolean, speed: number = 25) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const wordsRef = useRef<string[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(fullText);
      setIsComplete(true);
      return;
    }

    wordsRef.current = fullText.split(' ');
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (indexRef.current < wordsRef.current.length) {
        setDisplayedText(prev => 
          prev + (prev ? ' ' : '') + wordsRef.current[indexRef.current]
        );
        indexRef.current++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [fullText, isActive, speed]);

  return { displayedText, isComplete };
}

function MessageBubble({ message, isLatest }: { message: Message; isLatest: boolean }) {
  const isUser = message.role === 'user';
  const { displayedText, isComplete } = useStreamingText(
    message.content, 
    isLatest && !isUser && !!message.isStreaming
  );

  return (
    <div className={`flex gap-4 py-6 ${isUser ? 'bg-slate-800/30' : 'bg-slate-900/30'}`}>
      <div className="max-w-3xl mx-auto w-full px-4 flex gap-4">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-teal-500'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-1 text-slate-200">
            {isUser ? 'Du' : 'StadtHirsch KI'}
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown 
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-300">{children}</p>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-slate-300">{children}</li>,
                code: ({ children }) => <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sm text-slate-200">{children}</code>,
              }}
            >
              {isLatest && !isUser && message.isStreaming ? displayedText : message.content}
            </ReactMarkdown>
            {!isComplete && isLatest && !isUser && message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ currentStage, messageCount }: { currentStage: string; messageCount: number }) {
  const currentIndex = STAGES.findIndex(s => s.key === currentStage);
  const progress = Math.min(((currentIndex + 1) / STAGES.length) * 100, 100);
  
  return (
    <div className="bg-slate-900/50 backdrop-blur border-b border-slate-800 px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Briefing-Fortschritt</span>
          <span className="text-xs text-emerald-400">{Math.round(progress)}%</span>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {STAGES.map((stage, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = stage.icon;
            
            return (
              <div key={stage.key} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isCurrent 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : isActive 
                      ? 'bg-slate-800 text-slate-300' 
                      : 'bg-slate-900 text-slate-500'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{stage.label}</span>
                </div>
                {index < STAGES.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-600 mx-1" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="mt-2 text-xs text-slate-500">
          {messageCount} Nachrichten im Gespräch
        </div>
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadProjects();
    createNewProject();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/project?limit=10');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const createNewProject = async () => {
    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: 'Neues Briefing', project_type: null })
      });
      
      if (!response.ok) throw new Error('Failed to create project');
      
      const data = await response.json();
      setProject({ ...data.project, status: 'briefing' });
      
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Willkommen beim StadtHirsch KI-Briefing!\n\nIch bin dein strategischer Partner für kommunikative Spitzenergebnisse. Gemeinsam entwickeln wir ein fundiertes Briefing für dein Projekt.\n\n**Worum geht es bei deinem Vorhaben?**\n\nZum Beispiel:\n- Neues Logo für unser Tech-Startup\n- Corporate Identity für eine Beratungsfirma\n- Social Media Strategie für einen Onlineshop`,
        timestamp: new Date()
      }]);
      
      loadProjects();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !project || isLoading) return;

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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          message: userMessage
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      const aiMsg: Message = {
        id: data.conversationId || Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        isStreaming: true
      };
      setMessages(prev => [...prev, aiMsg]);

      if (data.caseDetected && data.caseDetected !== project.project_type) {
        setProject(prev => prev ? { ...prev, project_type: data.caseDetected } : null);
      }

      // Update status if document ready
      if (data.isComplete) {
        setProject(prev => prev ? { ...prev, status: 'document' } : null);
      }

    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Entschuldigung, es gab ein technisches Problem. Bitte versuche es noch einmal.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateDocument = async () => {
    if (!project) return;
    
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StadtHirsch_Briefing_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const toggleVoiceInput = () => {
    setIsRecording(!isRecording);
  };

  const caseConfig = project?.project_type ? CASE_CONFIGS[project.project_type] : null;
  const isComplete = project?.status === 'document' || messages.some(m => 
    m.content.toLowerCase().includes('genug informationen') || 
    m.content.toLowerCase().includes('briefing erstellen')
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 w-72 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">StadtHirsch</h1>
              <p className="text-xs text-slate-400">KI-Briefing System</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={createNewProject}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-700 group-hover:bg-slate-600 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-medium">Neues Briefing</span>
          </button>
        </div>

        {/* Project History */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
            Letzte Briefings
          </div>
          <div className="space-y-2">
            {projects.map(p => {
              const pConfig = p.project_type ? CASE_CONFIGS[p.project_type] : null;
              return (
                <button
                  key={p.id}
                  onClick={() => setProject(p)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                    project?.id === p.id 
                      ? 'bg-slate-800 border border-slate-700' 
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    pConfig?.bgColor || 'bg-slate-800'
                  }`}>
                    {pConfig?.icon || '💬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-slate-200">
                      {p.customer_name}
                    </div>
                    <div className={`text-xs ${pConfig?.color || 'text-slate-500'}`}>
                      {pConfig?.label || 'Allgemein'}
                    </div>
                  </div>
                  {p.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System bereit</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-950">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-slate-900/50 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {caseConfig ? (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${caseConfig.bgColor} border`}>
                <span className="text-lg">{caseConfig.icon}</span>
                <span className={`font-medium text-sm ${caseConfig.color}`}>{caseConfig.label}</span>
              </div>
            ) : (
              <span className="text-slate-400 text-sm">Wähle einen Projekttyp...</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isComplete && (
              <button
                onClick={generateDocument}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Briefing erstellen</span>
              </button>
            )}
          </div>
        </header>

        {/* Progress Bar */}
        <ProgressBar 
          currentStage={project?.status || 'briefing'} 
          messageCount={messages.length}
        />

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Willkommen!</h2>
                <p className="text-slate-400 max-w-sm">
                  Starte ein neues Briefing oder wähle ein bestehendes Projekt aus der Sidebar.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  isLatest={index === messages.length - 1}
                />
              ))}
              
              {isLoading && (
                <div className="flex gap-4 py-6 bg-slate-900/30">
                  <div className="max-w-3xl mx-auto w-full px-4 flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <footer className="bg-slate-900/50 backdrop-blur border-t border-slate-800 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-slate-800/80 rounded-2xl border border-slate-700 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Schreibe deine Nachricht..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent px-4 py-4 resize-none outline-none min-h-[56px] max-h-[200px] text-slate-200 placeholder-slate-500"
              />
              
              <div className="flex items-center gap-1 pr-2 pb-2">
                <button
                  onClick={toggleVoiceInput}
                  className={`p-2.5 rounded-xl transition-all ${
                    isRecording 
                      ? 'bg-red-500/20 text-red-400 animate-pulse' 
                      : 'hover:bg-slate-700 text-slate-400'
                  }`}
                  title="Spracheingabe"
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-center text-xs text-slate-500 mt-3">
              KI kann Fehler machen. Wichtige Informationen bitte überprüfen. • 
              <span className="text-slate-400"> Powered by StadtHirsch & Mario Pricken Methodik</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
