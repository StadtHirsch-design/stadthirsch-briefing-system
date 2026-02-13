'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, FileText, Loader2, Download, Sparkles, Mic, User, Bot, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    caseDetected?: string;
    isComplete?: boolean;
  };
}

interface Project {
  id: string;
  customer_name: string;
  project_type: string | null;
  status: string;
}

const CASE_STYLES: Record<string, { icon: string; color: string; label: string }> = {
  logo: { icon: '🎨', color: 'from-purple-500 to-pink-500', label: 'Logo-Entwicklung' },
  ci: { icon: '🏢', color: 'from-blue-500 to-cyan-500', label: 'Corporate Identity' },
  bildwelt: { icon: '📸', color: 'from-green-500 to-emerald-500', label: 'Bildwelt' },
  piktogramme: { icon: '🎯', color: 'from-orange-500 to-red-500', label: 'Piktogramme' },
  social: { icon: '📱', color: 'from-pink-500 to-rose-500', label: 'Social Media' },
};

export default function ChatInterface() {
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    createProject();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createProject = async () => {
    try {
      setError(null);
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'Neues Projekt',
          project_type: null
        })
      });
      
      if (!response.ok) throw new Error('Fehler beim Erstellen des Projekts');
      
      const data = await response.json();
      setProject(data.project);
      
      // Willkommensnachricht
      addMessage({
        id: 'welcome',
        role: 'assistant',
        content: `Willkommen beim StadtHirsch KI-Briefing!\n\nIch bin dein strategischer Partner für kommunikative Spitzenergebnisse. Gemeinsam entwickeln wir ein fundiertes Briefing für dein Projekt.\n\n**Worum geht es bei deinem Vorhaben?**\n\nZum Beispiel:\n• "Neues Logo für unser Tech-Startup"\n• "Corporate Identity für eine Beratungsfirma"\n• "Social Media Strategie für einen Onlineshop"`,
        timestamp: new Date()
      });
    } catch (err) {
      setError('Verbindungsfehler. Bitte Seite neu laden.');
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !project || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    // Benutzernachricht sofort anzeigen
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          message: userMessage,
          context: messages.slice(-3).map(m => ({ role: m.role, message: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server-Fehler: ${response.status}`);
      }

      const data = await response.json();
      
      setIsTyping(false);

      // KI-Antwort anzeigen
      addMessage({
        id: data.conversationId || Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: {
          caseDetected: data.caseDetected,
          isComplete: data.isComplete
        }
      });

      // Projekt aktualisieren wenn Case erkannt
      if (data.caseDetected && data.caseDetected !== project.project_type) {
        setProject(prev => prev ? { ...prev, project_type: data.caseDetected } : null);
      }

    } catch (err) {
      setIsTyping(false);
      setError('Verbindung zur KI vorübergehend gestört. Bitte versuche es erneut.');
      
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Entschuldigung, es gab ein technisches Problem. Bitte sende deine Nachricht noch einmal.',
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
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

      if (!response.ok) throw new Error('Export fehlgeschlagen');

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
      setError('Fehler beim Erstellen des Dokuments');
    }
  };

  const isComplete = messages.some(m => m.metadata?.isComplete);
  const caseStyle = project?.project_type ? CASE_STYLES[project.project_type] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${caseStyle?.color || 'from-blue-500 to-purple-500'} flex items-center justify-center text-xl shadow-lg shadow-blue-500/20`}>
              {caseStyle?.icon || '✨'}
            </div>
            <div>
              <h1 className="font-semibold text-white">StadtHirsch KI-Briefing</h1>
              <p className="text-xs text-slate-400">{caseStyle?.label || 'Wähle einen Projekttyp'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isComplete && (
              <button
                onClick={generateDocument}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-medium text-sm hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Briefing downloaden</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Chat Area */}
      <main className="pt-24 pb-32 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message */}
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                  : 'bg-slate-800/80 border border-white/10 text-slate-200'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line.startsWith('**') && line.endsWith('**') ? (
                        <strong className="text-white">{line.replace(/\*\*/g, '')}</strong>
                      ) : line.startsWith('•') ? (
                        <span className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{line.substring(1).trim()}</span>
                        </span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
                <span className="text-xs opacity-50 mt-2 block">
                  {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800/80 border border-white/10 rounded-2xl px-5 py-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Schreibe deine Antwort..."
                disabled={isLoading}
                rows={1}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-medium text-white hover:from-blue-400 hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <p className="text-center text-xs text-slate-500 mt-3">
            Powered by StadtHirsch Agentur-Expertise & Mario Pricken Methodik
          </p>
        </div>
      </footer>
    </div>
  );
}
