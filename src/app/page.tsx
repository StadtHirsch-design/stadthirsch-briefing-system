'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Loader2, Download, Mic, User, Bot, Plus, Menu, X,
  ChevronRight, MessageSquare, Sparkles, History, FileText
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
  status: string;
  created_at: string;
}

const CASE_CONFIGS: Record<string, { icon: string; label: string; color: string }> = {
  logo: { icon: '🎨', label: 'Logo', color: 'text-purple-400' },
  ci: { icon: '🏢', label: 'Corporate Identity', color: 'text-blue-400' },
  bildwelt: { icon: '📸', label: 'Bildwelt', color: 'text-green-400' },
  piktogramme: { icon: '🎯', label: 'Piktogramme', color: 'text-orange-400' },
  social: { icon: '📱', label: 'Social Media', color: 'text-pink-400' },
};

// Streaming hook for word-by-word animation
function useStreamingText(fullText: string, isActive: boolean, speed: number = 30) {
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
    <div className={`flex gap-4 py-6 ${isUser ? 'bg-slate-800/30' : 'bg-slate-900/50'}`}>
      <div className="max-w-3xl mx-auto w-full px-4 flex gap-4">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-blue-600' : 'bg-emerald-600'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-1">
            {isUser ? 'Du' : 'StadtHirsch KI'}
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-slate-300">{children}</li>,
                code: ({ children }) => <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sm">{children}</code>,
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

  // Load projects for sidebar
  useEffect(() => {
    loadProjects();
  }, []);

  // Create new project on mount
  useEffect(() => {
    if (!project) {
      createNewProject();
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
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
      setProject(data.project);

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

    // Add user message
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

      // Add AI message with streaming
      const aiMsg: Message = {
        id: data.conversationId || Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        isStreaming: true
      };
      setMessages(prev => [...prev, aiMsg]);

      // Update project type if detected
      if (data.caseDetected && data.caseDetected !== project.project_type) {
        setProject(prev => prev ? { ...prev, project_type: data.caseDetected } : null);
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

  // Voice input handler
  const toggleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const caseConfig = project?.project_type ? CASE_CONFIGS[project.project_type] : null;
  const isComplete = messages.some(m => m.content.toLowerCase().includes('genug informationen'));

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 w-64 h-full bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={createNewProject}
            className="w-full flex items-center gap-3 px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Neues Briefing</span>
          </button>
        </div>

        {/* Project History */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="text-xs font-medium text-slate-500 uppercase px-3 py-2">
            Letzte Briefings
          </div>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setProject(p)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm hover:bg-slate-800 transition-colors ${
                project?.id === p.id ? 'bg-slate-800' : ''
              }`}
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <div className="flex-1 truncate">
                <div className="truncate">{p.customer_name}</div>
                <div className="text-xs text-slate-500">
                  {CASE_CONFIGS[p.project_type || '']?.label || 'Allgemein'}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 text-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Powered by StadtHirsch</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {caseConfig && (
              <div className="flex items-center gap-2">
                <span className="text-xl">{caseConfig.icon}</span>
                <span className="font-medium">{caseConfig.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isComplete && (
              <button
                onClick={generateDocument}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Briefing erstellen</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}

          {isLoading && (
            <div className="flex gap-4 py-6 bg-slate-900/50">
              <div className="max-w-3xl mx-auto w-full px-4 flex gap-4">
                <div className="w-8 h-8 rounded-sm bg-emerald-600 flex items-center justify-center">
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

          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-slate-800 rounded-xl border border-slate-700 focus-within:border-slate-500 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Schreibe deine Nachricht..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent px-4 py-3.5 resize-none outline-none min-h-[52px] max-h-[200px]"
              />

              <div className="flex items-center gap-1 pr-2 pb-2">
                <button
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording ? 'bg-red-500/20 text-red-400' : 'hover:bg-slate-700 text-slate-400'
                  }`}
                  title="Spracheingabe"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-2">
              KI kann Fehler machen. Wichtige Informationen bitte überprüfen.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
