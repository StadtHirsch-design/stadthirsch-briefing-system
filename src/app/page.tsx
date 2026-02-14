'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, Loader2, Mic, User, Bot, Plus, Menu, 
  Sparkles, FileText, ChevronRight, CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Types
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
}

// Case configurations - Apple Minimal Style
const CASE_CONFIGS: Record<string, { icon: string; label: string }> = {
  logo: { icon: '◆', label: 'Logo' },
  ci: { icon: '◎', label: 'Corporate Identity' },
  bildwelt: { icon: '◉', label: 'Bildwelt' },
  piktogramme: { icon: '▣', label: 'Piktogramme' },
  social: { icon: '◈', label: 'Social Media' },
};

const STAGES = [
  { key: 'briefing', label: 'Briefing' },
  { key: 'research', label: 'Recherche' },
  { key: 'strategy', label: 'Strategie' },
  { key: 'document', label: 'Dokument' },
];

// Streaming hook
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

// Message Bubble - Apple Minimal Design
function MessageBubble({ message, isLatest }: { message: Message; isLatest: boolean }) {
  const isUser = message.role === 'user';
  const { displayedText, isComplete } = useStreamingText(
    message.content, 
    isLatest && !isUser && !!message.isStreaming
  );

  return (
    <div className={`py-6 ${isUser ? 'bg-[#F5F5F7]' : 'bg-white'}`}>
      <div className="max-w-3xl mx-auto px-6 flex gap-4">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-[#1D1D1F] text-white' : 'bg-[#007AFF] text-white'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="font-semibold text-sm mb-1 text-[#1D1D1F]">
            {isUser ? 'Du' : 'StadtHirsch'}
          </div>
          <div className="prose prose-sm max-w-none text-[#1D1D1F]">
            <ReactMarkdown 
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                code: ({ children }) => <code className="bg-[#F5F5F7] px-1.5 py-0.5 rounded text-sm">{children}</code>,
              }}
            >
              {isLatest && !isUser && message.isStreaming ? displayedText : message.content}
            </ReactMarkdown>
            {!isComplete && isLatest && !isUser && message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-[#007AFF] ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Indicator - Minimal
function ProgressIndicator({ currentStage }: { currentStage: string }) {
  const currentIndex = STAGES.findIndex(s => s.key === currentStage);
  const progress = Math.min(((currentIndex + 1) / STAGES.length) * 100, 100);
  
  return (
    <div className="bg-white border-b border-[#E8E8ED] px-6 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#6E6E73] uppercase tracking-wide">
            Fortschritt
          </span>
          <span className="text-xs font-semibold text-[#007AFF]">{Math.round(progress)}%</span>
        </div>
        
        {/* Steps */}
        <div className="flex items-center gap-3">
          {STAGES.map((stage, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={stage.key} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 text-xs ${
                  isCurrent ? 'text-[#007AFF] font-semibold' : 
                  isActive ? 'text-[#1D1D1F]' : 'text-[#86868B]'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isCurrent ? 'bg-[#007AFF]' : 
                    isActive ? 'bg-[#86868B]' : 'bg-[#E8E8ED]'
                  }`} />
                  <span className="hidden sm:inline">{stage.label}</span>
                </div>
                {index < STAGES.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${
                    index < currentIndex ? 'bg-[#D2D2D7]' : 'bg-[#E8E8ED]'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-3 h-1 bg-[#E8E8ED] rounded-full overflow-hidden">
          <div className="h-full bg-[#007AFF] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function ChatInterface() {
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
        content: `**Willkommen beim StadtHirsch KI-Briefing**

Ich helfe dir, ein professionelles Briefing für dein Projekt zu entwickeln.

**Worum geht es bei deinem Vorhaben?**

*Beispiele:*
• Neues Logo für ein Tech-Startup
• Corporate Identity für eine Beratungsfirma  
• Social Media Strategie für einen Onlineshop`,
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
        body: JSON.stringify({ projectId: project.id, message: userMessage })
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

  const caseConfig = project?.project_type ? CASE_CONFIGS[project.project_type] : null;
  
  const isComplete = project?.status === 'document' || messages.some(m => 
    m.content.toLowerCase().includes('briefing erstellen')
  );

  return (
    <div className="flex h-screen bg-white text-[#1D1D1F] overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 w-72 h-full bg-[#F5F5F7] border-r border-[#E8E8ED] transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-5 border-b border-[#E8E8ED]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#007AFF] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[#1D1D1F]">StadtHirsch</h1>
              <p className="text-xs text-[#6E6E73]">KI-Briefing</p>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <div className="p-4">
          <button
            onClick={createNewProject}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#E8E8ED] rounded-xl transition-all border border-[#E8E8ED]"
          >
            <div className="w-7 h-7 rounded-lg bg-[#007AFF]/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-[#007AFF]" />
            </div>
            <span className="font-medium text-sm">Neues Briefing</span>
          </button>
        </div>

        {/* Project History */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="text-xs font-medium text-[#6E6E73] uppercase tracking-wide px-3 py-3">
            Letzte Briefings
          </div>
          <div className="space-y-1">
            {projects.map(p => {
              const pConfig = p.project_type ? CASE_CONFIGS[p.project_type] : null;
              return (
                <button
                  key={p.id}
                  onClick={() => setProject(p)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                    project?.id === p.id 
                      ? 'bg-white shadow-sm' 
                      : 'hover:bg-white/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-lg">
                    {pConfig?.icon || '◆'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-[#1D1D1F]">{p.customer_name}</div>
                    <div className="text-xs text-[#6E6E73]">{pConfig?.label || 'Allgemein'}</div>
                  </div>
                  {p.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-[#34C759] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E8ED]">
          <div className="flex items-center gap-2 text-xs text-[#6E6E73]">
            <div className="w-2 h-2 rounded-full bg-[#34C759]" />
            <span>System bereit</span>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#E8E8ED]">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 hover:bg-[#F5F5F7] rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            
            {caseConfig ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-sm font-medium">
                <span>{caseConfig.icon}</span>
                <span>{caseConfig.label}</span>
              </div>
            ) : (
              <span className="text-[#6E6E73] text-sm">Wähle einen Projekttyp...</span>
            )}
          </div>

          {isComplete && (
            <button onClick={generateDocument} className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] hover:bg-[#0051D5] text-white rounded-xl text-sm font-medium transition-colors">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Briefing erstellen</span>
            </button>
          )}
        </header>

        {/* Progress */}
        <ProgressIndicator currentStage={project?.status || 'briefing'} />

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-6">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#007AFF] flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#1D1D1F] mb-2">Willkommen</h2>
                <p className="text-[#6E6E73] max-w-sm">Starte ein neues Briefing oder wähle ein bestehendes Projekt aus.</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble key={message.id} message={message} isLatest={index === messages.length - 1} />
              ))}
              
              {isLoading && (
                <div className="py-6 bg-white">
                  <div className="max-w-3xl mx-auto px-6 flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 pt-2">
                      <div className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
        <footer className="bg-white border-t border-[#E8E8ED] p-5">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-[#F5F5F7] rounded-2xl p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Schreibe eine Nachricht..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent px-3 py-3 resize-none outline-none min-h-[44px] max-h-[200px] text-[#1D1D1F] placeholder:text-[#86868B]"
              />
              
              <div className="flex items-center gap-1 pr-1 pb-1">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2.5 rounded-xl transition-colors ${
                    isRecording ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'hover:bg-[#E8E8ED] text-[#6E6E73]'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 bg-[#007AFF] hover:bg-[#0051D5] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <p className="text-center text-xs text-[#86868B] mt-3">
              KI kann Fehler machen. Wichtige Informationen bitte überprüfen.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
